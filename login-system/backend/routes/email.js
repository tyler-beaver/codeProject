const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

// ===============================
// Ensure required tables/columns exist (lightweight migration)
// ===============================
async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    console.warn("ensureSchema skipped: DATABASE_URL not set");
    return;
  }
  await pool.query(
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT"
  );
  try {
    await pool.query(`
      ALTER TABLE email_accounts ALTER COLUMN user_id TYPE TEXT USING user_id::text
    `);
  } catch (e) {
    // ignore if table doesn't exist yet
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_accounts (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS email_accounts_user_provider_idx
    ON email_accounts(user_id, provider)
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS application_status_updates (
      id SERIAL PRIMARY KEY,
      application_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      source TEXT DEFAULT 'email',
      email_id TEXT,
      subject TEXT,
      body_snippet TEXT,
      occurred_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

// Initialize schema on module load
ensureSchema().catch((e) => console.error("ensureSchema error:", e));

// ===============================
// Google OAuth helpers
// ===============================
function buildOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_URL || "http://localhost:5001"}/api/email/google/callback`;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function signState(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });
}

function verifyState(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// GET /api/email/google/url?userId=123
router.get("/google/url", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({
      error: "Missing Google OAuth configuration",
      missing: {
        GOOGLE_CLIENT_ID: !process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI: !process.env.GOOGLE_REDIRECT_URI,
      },
      hint: "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in backend .env",
    });
  }
  const oauth2Client = buildOAuthClient();
  const scopes = ["https://www.googleapis.com/auth/gmail.readonly"];
  const state = signState({ userId });
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state,
  });
  res.json({ url });
});

// GET /api/email/google/callback?code=...&state=...
router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const decoded = verifyState(state);
  if (!decoded || !decoded.userId) {
    return res.status(400).send("Invalid state");
  }
  const userId = decoded.userId;
  try {
    const oauth2Client = buildOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    const expires = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : null;
    if (!process.env.DATABASE_URL) {
      const redirect = `${process.env.FRONTEND_URL || "http://localhost:3000"}/#/profile?connected=google`;
      return res.redirect(redirect);
    }
    try {
      await pool.query(
        `
        INSERT INTO email_accounts (user_id, provider, access_token, refresh_token, token_expires_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, provider) DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = COALESCE(EXCLUDED.refresh_token, email_accounts.refresh_token),
          token_expires_at = EXCLUDED.token_expires_at,
          updated_at = NOW()
        `,
        [userId, "google", tokens.access_token || null, tokens.refresh_token || null, expires]
      );
      const redirect = `${process.env.FRONTEND_URL || "http://localhost:3000"}/#/profile?connected=google`;
      return res.redirect(redirect);
    } catch (dbErr) {
      console.error("Google OAuth DB save error:", dbErr?.message || dbErr);
      const redirect = `${process.env.FRONTEND_URL || "http://localhost:3000"}/#/profile?error=db_save_failed`;
      return res.redirect(redirect);
    }
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    const redirect = `${process.env.FRONTEND_URL || "http://localhost:3000"}/#/profile?error=oauth_failed`;
    res.redirect(redirect);
  }
});

async function getGoogleClientForUser(userId) {
  const oauth2Client = buildOAuthClient();
  const { rows } = await pool.query(
    "SELECT * FROM email_accounts WHERE user_id=$1 AND provider='google'",
    [userId]
  );
  if (rows.length === 0) return null;
  const acct = rows[0];
  oauth2Client.setCredentials({
    access_token: acct.access_token,
    refresh_token: acct.refresh_token,
  });
  return oauth2Client;
}

// ===============================
// Helpers for text processing
// ===============================
function normalizeText(input) {
  return (input || "")
    .toLowerCase()
    .replace(/[\r\n]+/g, " ")
    .replace(/[^a-z0-9&\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeBase64Url(data) {
  if (!data) return "";
  const str = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(str, "base64").toString("utf8");
  } catch (e) {
    return "";
  }
}

function stripHtml(html) {
  return (html || "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBodyText(payload) {
  if (!payload) return "";
  const parts = payload.parts || [];
  const plainPart = parts.find((p) => (p.mimeType || "").toLowerCase() === "text/plain");
  if (plainPart && plainPart.body && plainPart.body.data) {
    return decodeBase64Url(plainPart.body.data);
  }
  for (const part of parts) {
    if (part.parts && part.parts.length) {
      const nested = getBodyText(part);
      if (nested) return nested;
    }
  }
  const htmlPart = parts.find((p) => (p.mimeType || "").toLowerCase() === "text/html");
  if (htmlPart && htmlPart.body && htmlPart.body.data) {
    return stripHtml(decodeBase64Url(htmlPart.body.data));
  }
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }
  return "";
}

function getAttachmentTypes(payload) {
  const types = [];
  const walk = (p) => {
    if (!p) return;
    if (p.mimeType) types.push(p.mimeType.toLowerCase());
    if (p.parts && Array.isArray(p.parts)) {
      p.parts.forEach((pp) => walk(pp));
    }
  };
  walk(payload);
  return types;
}

function getDomainFromFromHeader(fromHeader) {
  const lower = (fromHeader || "").toLowerCase();
  const domainMatch = lower.match(/@([a-z0-9.-]+)\b/);
  return domainMatch ? domainMatch[1] : null;
}

function isLikelyJobEmail({ subject, body, from }) {
  const text = `${subject || ""} ${body || ""}`.toLowerCase();
  const domain = getDomainFromFromHeader(from);
  const hasProviderDomain = domain && JOB_PROVIDER_DOMAINS.some((d) => domain.includes(d));
  const positiveSignals = [
    /(application|applied|candidate|position|role|job|opportunity|requisition|req\s?#?\d+)/i,
    /(interview|phone screen|onsite|assessment|coding challenge|take home)/i,
    /(offer|extend(ing)? an offer)/i,
    /(rejected|declined|not selected|not moving forward|no longer under consideration)/i,
  ].some((re) => re.test(text));
  const hasNegative = NEGATIVE_TERMS.some((t) => text.includes(t));
  const isLinkedIn = domain && domain.includes("linkedin.com");
  const providerOk = isLinkedIn ? positiveSignals : (hasProviderDomain || positiveSignals);
  return providerOk && !hasNegative;
}

function extractCompany(fromHeader, subject) {
  const from = (fromHeader || "").toLowerCase();
  const subj = (subject || "").toLowerCase();
  const domainMatch = from.match(/@([a-z0-9.-]+)\b/);
  const domain = domainMatch ? domainMatch[1] : null;
  let companyHint = domain ? domain.split(".")[0] : null;
  const titleWord = (subject || "").match(/\b([A-Z][a-zA-Z0-9&]+)/);
  if (!companyHint && titleWord) companyHint = titleWord[1].toLowerCase();
  if (!companyHint) {
    const display = getDisplayName(fromHeader);
    companyHint = sanitizeCompanyName(display);
  }
  return companyHint;
}

function getDisplayName(fromHeader) {
  const raw = (fromHeader || "").trim();
  const angleIdx = raw.indexOf("<");
  return angleIdx > 0 ? raw.substring(0, angleIdx).trim() : raw;
}

function sanitizeCompanyName(name) {
  const n = (name || "").toLowerCase();
  const cleaned = n
    .replace(/(talent acquisition|careers|jobs|noreply|no-reply|support|mailer|notification|do[- ]?not[- ]?reply)/g, "")
    .replace(/[^a-z0-9&\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const token = cleaned.split(" ")[0] || "";
  return token || cleaned;
}

function extractDetails(subject, body, fromHeader) {
  const s = subject || "";
  const b = body || "";
  const domain = getDomainFromFromHeader(fromHeader) || "";
  let company = extractCompany(fromHeader, subject);
  let role = null;
  const rolePatterns = [
    /application for ([^,]+?)(?: at ([^,]+))?/i,
    /your application (?:to|at) ([^,]+?) for ([^,]+?)(?:\.|,|$)/i,
    /we received your application for ([^,]+?)(?: at ([^,]+))?/i,
    /consideration for (.+?)(?: at ([^,]+))?(?:\.|,|$)/i,
    /opening:?\s+(.+?)(?: at ([^,]+))?(?:\.|,|$)/i,
  ];
  for (const re of rolePatterns) {
    const m = s.match(re) || b.match(re);
    if (m) {
      role = (m[1] || "").trim();
      const companyFromRole = (m[2] || "").trim();
      if (!company && companyFromRole) company = companyFromRole;
      break;
    }
  }
  const reqMatch = (s + " " + b).match(/req\s?#?(\d{3,})/i);
  const reqId = reqMatch ? reqMatch[1] : null;
  const linkMatch = (b || "").match(/https?:\/\/\S+/i);
  const link = linkMatch ? linkMatch[0] : null;
  return { role, company, reqId, link };
}

function extractInterviewDateTime(text) {
  const dateMatch = text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b/i)
    || text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  const timeMatch = text.match(/\b\d{1,2}:\d{2}\s*(AM|PM)\b/i)
    || text.match(/\b\d{1,2}\s*(AM|PM)\b/i);
  return {
    date: dateMatch ? dateMatch[0] : null,
    time: timeMatch ? timeMatch[0] : null,
  };
}

// ===============================
// Job email constants
// ===============================
const JOB_PROVIDER_DOMAINS = [
  "indeed.com","linkedin.com","icims.com","workday.com","greenhouse.io","greenhousemail.io",
  "lever.co","smartrecruiters.com","workable.com","jobvite.com","hackertrail.com",
  "eightfold.ai","successfactors.com","myworkday.com","oraclecloud.com",
];

const NEGATIVE_TERMS = [
  "newsletter","digest","blog","promo","promotion","marketing","password",
  "reset your password","2fa","notification","receipt","invoice","order","tracking",
  "shipment","ticket","issue","downtime","incident","viewed your profile","accepted your invitation",
  "invitation","connection","follower","follow","like","comment",
];

// ===============================
// Enhanced Email Classifier
// ===============================
const PHRASES = {
  Applied: [
    [/application received/i, 0.9],[ /thanks for applying/i,0.9],[ /we received your application/i,0.9],
    [/has been submitted/i,0.8],[ /under review/i,0.8],[ /thank you for submitting/i,0.8],
    [/our team will review/i,0.7],[ /you will hear from us/i,0.5],
  ],
  Interview: [
    [/interview/i,0.8],[ /phone screen/i,0.8],[ /assessment|coding challenge|take home/i,0.7],
    [/schedule (a )?(call|meeting)/i,0.7],[ /availability/i,0.6],[ /move forward/i,1.0],
    [/next round|next step/i,0.9],[ /advance to the next/i,0.9],[ /invite you to continue/i,0.8],
    [/meet with our team/i,0.8],[ /speak with our hiring manager/i,0.9],[ /schedule a time to chat/i,0.8],
    [/looking forward to speaking/i,0.7],
  ],
  Rejected: [
    [/we regret to inform/i,1.0],[ /not moving forward/i,1.0],[ /not advancing your application/i,1.0],
    [/decided not to proceed/i,1.0],[ /moving ahead with other applicants/i,1.0],[ /selected another candidate/i,0.9],
    [/position has been filled/i,0.8],[ /unable to offer you/i,1.0],[ /not the right fit/i,0.8],
    [/we encourage you to apply again/i,0.7],[ /keep your resume on file/i,0.6],[ /unfortunately/i,0.7],
  ],
  Offer: [
    [/offer/i,1.0],[ /formal offer/i,1.0],[ /employment offer/i,1.0],[ /excited to offer you/i,1.0],
    [/extend(ing)? an offer/i,1.0],[ /offer letter/i,0.9],[ /salary and benefits/i,0.8],[ /sign and return/i,0.9],
    [/start date/i,0.7],
  ],
};

const STRONG_SIGNALS = {
  Interview: [/move forward/i, /next round/i],
  Rejected: [/unable to offer/i, /not moving forward/i],
  Offer: [/formal offer/i, /employment offer/i],
};

function scoreEmailStatus({ text, domain, attachments }) {
  const t = normalizeText(text);
  const scores = { Applied:0, Interview:0, Rejected:0, Offer:0 };

  // Base phrase scoring
  Object.entries(PHRASES).forEach(([status, patterns]) => {
    patterns.forEach(([regex, weight]) => {
      if(regex.test(t)) scores[status] += weight;
    });
  });

  // Strong signal boost
  Object.entries(STRONG_SIGNALS).forEach(([status, patterns])=>{
    if(patterns.some(re=>re.test(t))) scores[status] +=1.2;
  });

  // Combo logic
  if(t.includes("unfortunately") && t.includes("thank you")) scores.Rejected += 0.8;

  // Domain boost
  if(domain && JOB_PROVIDER_DOMAINS.some(d=>domain.includes(d))) {
    scores.Applied += 0.1;
    scores.Interview += 0.1;
  }

  // PDF boost
  if((attachments||[]).some(a=>a.includes("application/pdf"))) scores.Offer += 0.3;

  // Pick best
  let bestStatus=null, bestScore=0;
  Object.entries(scores).forEach(([status, score])=>{
    if(score>bestScore){bestScore=score; bestStatus=status;}
  });

  return { status: bestStatus, confidence: Math.min(bestScore/2,1) };
}

// Optional AI fallback
async function classifyWithAI(text) {
  if(!process.env.OPENAI_API_KEY) return null;
  const { OpenAI } = require("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Classify job emails into Applied, Interview, Rejected, Offer, Other. Respond JSON." },
        { role: "user", content: text.slice(0,3000) }
      ],
      response_format: { type:"json_object" },
    });
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return null;
  }
}

// ===============================
// Main Gmail Sync Function
// ===============================
async function syncGmailEmailsForUser(userId) {
  const oauthClient = await getGoogleClientForUser(userId);
  if(!oauthClient) return console.warn("No Google account linked for user", userId);

  const gmail = google.gmail({ version:"v1", auth:oauthClient });
  let res;
  try { res = await gmail.users.messages.list({ userId:"me", maxResults:50 }); }
  catch(e){ return console.error("Gmail list error:", e.message||e); }
  const messages = res.data.messages || [];

  let skipped=0, reasonCounts={low_confidence:0, missing_body:0};

  for(const msg of messages) {
    let detail;
    try { detail = await gmail.users.messages.get({ userId:"me", id:msg.id }); }
    catch(e){ console.error("Gmail get msg error", e.message||e); continue; }

    const payload = detail.data.payload || {};
    const headers = payload.headers || [];
    const subjectObj = headers.find(h=>h.name.toLowerCase()==="subject");
    const fromObj = headers.find(h=>h.name.toLowerCase()==="from");
    const subject = subjectObj?.value || "";
    const from = fromObj?.value || "";
    const bodyText = getBodyText(payload);
    const attachments = getAttachmentTypes(payload);
    const domain = getDomainFromFromHeader(from);

    if(!bodyText) { skipped++; reasonCounts.missing_body++; continue; }

    let { status, confidence } = scoreEmailStatus({ text: `${subject} ${bodyText}`, domain, attachments });

    if(confidence>0.3 && confidence<0.7) {
      const aiRes = await classifyWithAI(`${subject}\n${bodyText}`);
      if(aiRes && aiRes.status && aiRes.confidence>confidence) {
        status = aiRes.status;
        confidence = aiRes.confidence;
      }
    }

    if(!status || confidence<0.5) { skipped++; reasonCounts.low_confidence++; continue; }

    const details = extractDetails(subject, bodyText, from);
    const interview = extractInterviewDateTime(bodyText);

    console.log({ subject, predicted:status, confidence });

    try {
      await pool.query(
        `INSERT INTO application_status_updates
        (application_id, status, source, email_id, subject, body_snippet, occurred_at)
        VALUES ($1,$2,'email',$3,$4,$5,NOW())`,
        [null, status, msg.id, subject, bodyText.slice(0,200)]
      );
    } catch(e){ console.error("DB insert error:", e.message||e); }
  }

  console.log(`Sync finished. Skipped: ${skipped}`, reasonCounts);
}

// ===============================
// Expose router and sync
// ===============================
module.exports = {
  router,
  syncGmailEmailsForUser,
  scoreEmailStatus,
  classifyWithAI,
};
