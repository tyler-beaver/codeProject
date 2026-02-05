const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

// Ensure required tables/columns exist (lightweight migration)
async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    console.warn("ensureSchema skipped: DATABASE_URL not set");
    return;
  }
  await pool.query(
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT"
  );
  // Migrate existing column type if previously created as INTEGER
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
    // If no DB configured, skip save and redirect success for dev
    if (!process.env.DATABASE_URL) {
      const redirect = `${process.env.FRONTEND_URL || "http://localhost:3000"}/#/profile?connected=google`;
      return res.redirect(redirect);
    }
    try {
      // Upsert by unique pair (user_id, provider)
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

function classifyEmail({ subject, snippet, body }) {
  const text = `${subject || ""} ${snippet || ""} ${body || ""}`.toLowerCase();
  // Offer
  if (/(offer|congratulations|extend(ing)? an offer|we'd like to extend)/i.test(text)) return "Offer";
  // Interview
  if (/(interview|phone screen|onsite|schedule|availability|invite|set up a call)/i.test(text)) return "Interview";
  // Rejected
  if (/reject|declin|not selected|unfortunately|regret to inform|no longer under consideration|not moving forward|move forward with other candidates|won'?t be proceeding|unable to connect/i.test(text)) return "Rejected";
  // Applied / Confirmation
  if (/(application|applied|received|thanks for applying|confirmation|we received your application|your application has been submitted)/i.test(text)) return "Applied";
  return null;
}

function normalizeText(input) {
  return (input || "")
    .toLowerCase()
    .replace(/[\r\n]+/g, " ")
    .replace(/[^a-z0-9&\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

const STATUS_PRECEDENCE = { Rejected: 2, Applied: 1, Interview: 3, Offer: 4 };

function shouldUpdateStatus(existingStatus, proposedStatus, confidence) {
  if (!proposedStatus) return false;
  if (!existingStatus) return true;
  const current = STATUS_PRECEDENCE[existingStatus] || 0;
  const next = STATUS_PRECEDENCE[proposedStatus] || 0;
  // Never downgrade from Offer
  if (existingStatus === "Offer" && next < STATUS_PRECEDENCE.Offer) return false;
  // Allow strong Offer/Rejected even if same precedence
  if ((proposedStatus === "Offer" || proposedStatus === "Rejected") && confidence >= 0.7) return true;
  return next >= current;
}

function scoreEmailStatus({ text, domain, attachments }) {
  const scores = { Applied: 0, Interview: 0, Rejected: 0, Offer: 0 };
  const t = normalizeText(text);
  // Applied
  [
    { re: /application received/, w: 0.9 },
    { re: /thanks for applying/, w: 0.9 },
    { re: /we received your application/, w: 0.9 },
    { re: /has been submitted/, w: 0.8 },
    { re: /under review/, w: 0.5 },
    { re: /thank you for applying/, w: 0.8 },
    { re: /we appreciate your interest/, w: 0.4 },
  ].forEach(({ re, w }) => { if (re.test(t)) scores.Applied += w; });
  // Interview
  [
    { re: /interview/, w: 0.8 },
    { re: /phone screen/, w: 0.8 },
    { re: /schedule (a )?(call|meeting)/, w: 0.7 },
    { re: /availability/, w: 0.6 },
    { re: /invite/, w: 0.6 },
    { re: /assessment|coding challenge|take home/, w: 0.6 },
    { re: /next steps/, w: 0.5 },
    { re: /we d like to speak with you|we would like to speak with you/, w: 0.8 },
    { re: /please select a time/, w: 0.6 },
    { re: /moved to the next stage/, w: 0.6 },
    { re: /excited to invite you/, w: 0.6 },
    { re: /looking forward to speaking/, w: 0.6 },
    { re: /shortlisted/, w: 0.6 },
    { re: /additional information required/, w: 0.5 },
  ].forEach(({ re, w }) => { if (re.test(t)) scores.Interview += w; });
  // Rejected
  [
    { re: /we regret to inform/, w: 1.0 },
    { re: /not moving forward/, w: 1.0 },
    { re: /move forward with other candidates/, w: 1.0 },
    { re: /no longer under consideration/, w: 1.0 },
    { re: /won t be proceeding|won't be proceeding/, w: 0.9 },
    { re: /declined|reject/, w: 0.8 },
    { re: /unfortunately/, w: 0.7 },
    { re: /after careful consideration/, w: 0.9 },
    { re: /selected another candidate/, w: 0.9 },
    { re: /thank you for your interest/, w: 0.4 },
    { re: /we wish you the best/, w: 0.5 },
  ].forEach(({ re, w }) => { if (re.test(t)) scores.Rejected += w; });
  // Offer
  [
    { re: /offer/, w: 1.0 },
    { re: /pleased to offer you the position/, w: 1.0 },
    { re: /extend(ing)? an offer/, w: 1.0 },
    { re: /offer letter/, w: 0.9 },
    { re: /compensation/, w: 0.5 },
    { re: /start date/, w: 0.7 },
    { re: /welcome to/, w: 0.6 },
    { re: /we are delighted to extend an offer/, w: 1.0 },
    { re: /please find your offer letter attached/, w: 1.0 },
  ].forEach(({ re, w }) => { if (re.test(t)) scores.Offer += w; });
  // Domain boost (ATS domains imply Applied/Interview emails)
  if (domain && JOB_PROVIDER_DOMAINS.some((d) => domain.includes(d))) {
    scores.Applied += 0.1;
    scores.Interview += 0.1;
  }
  // Attachment boost for Offer (PDF likely offer letter)
  if ((attachments || []).some((mt) => mt.includes("application/pdf"))) {
    scores.Offer += 0.2;
  }
  // Pick best
  let status = null;
  let confidence = 0;
  Object.entries(scores).forEach(([k, v]) => {
    if (v > confidence) { confidence = v; status = k; }
  });
  return { status, confidence };
}

const JOB_PROVIDER_DOMAINS = [
  "indeed.com",
  "linkedin.com",
  "icims.com",
  "workday.com",
  "greenhouse.io",
  "greenhousemail.io",
  "lever.co",
  "smartrecruiters.com",
  "workable.com",
  "jobvite.com",
  "hackertrail.com",
  "eightfold.ai",
  "successfactors.com",
  "myworkday.com",
  "oraclecloud.com",
];

const NEGATIVE_TERMS = [
  "newsletter",
  "digest",
  "blog",
  "promo",
  "promotion",
  "marketing",
  "password",
  "reset your password",
  "2fa",
  "notification",
  "receipt",
  "invoice",
  "order",
  "tracking",
  "shipment",
  "ticket",
  "issue",
  "downtime",
  "incident",
  // Social/network noise
  "viewed your profile",
  "accepted your invitation",
  "invitation",
  "invite",
  "connection",
  "follower",
  "follow",
  "like",
  "comment",
];

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
    /(schedule|availability|invite|next steps|consideration|hiring|confirmation|received|thanks|submitted|speak with you|shortlisted|additional information required)/i,
  ].some((re) => re.test(text));
  const hasNegative = NEGATIVE_TERMS.some((t) => text.includes(t));
  // LinkedIn special-case: require positive job signals
  const isLinkedIn = domain && domain.includes("linkedin.com");
  const providerOk = isLinkedIn ? positiveSignals : (hasProviderDomain || positiveSignals);
  // Further loosen: ignore negative terms for known job domains
  if (hasProviderDomain) return providerOk;
  return providerOk && !hasNegative;
}

function extractDetails(subject, body, fromHeader) {
  const s = subject || "";
  const b = body || "";
  const domain = getDomainFromFromHeader(fromHeader) || "";
  // Company: prefer sender display/domain, else parse from subject
  let company = extractCompany(fromHeader, subject);
  if (!company && domain) {
    company = domain.split(".")[0];
  }
  // Role/title patterns
  const rolePatterns = [
    /application for ([^,]+?)(?: at ([^,]+))?/i,
    /your application (?:to|at) ([^,]+?) for ([^,]+?)(?:\.|,|$)/i,
    /we received your application for ([^,]+?)(?: at ([^,]+))?/i,
    /consideration for (.+?)(?: at ([^,]+))?(?:\.|,|$)/i,
    /opening:?\s+(.+?)(?: at ([^,]+))?(?:\.|,|$)/i,
  ];
  let role = null;
  let companyFromRole = null;
  for (const re of rolePatterns) {
    const m = s.match(re) || b.match(re);
    if (m) {
      role = (m[1] || "").trim();
      companyFromRole = (m[2] || "").trim();
      break;
    }
  }
  if (!company && companyFromRole) company = companyFromRole.toLowerCase();
  // Req ID
  const reqMatch = (s + " " + b).match(/req\s?#?(\d{3,})/i);
  const reqId = reqMatch ? reqMatch[1] : null;
  // First link (often application portal)
  const linkMatch = (b || "").match(/https?:\/\/\S+/i);
  const link = linkMatch ? linkMatch[0] : null;
  return { role, company, reqId, link };
}

function getDisplayName(fromHeader) {
  // e.g., "GitHub Talent Acquisition <no-reply@github.com>"
  const raw = (fromHeader || "").trim();
  const angleIdx = raw.indexOf("<");
  const display = angleIdx > 0 ? raw.substring(0, angleIdx).trim() : raw;
  return display;
}

function sanitizeCompanyName(name) {
  const n = (name || "").toLowerCase();
  // Remove generic words
  const cleaned = n
    .replace(/(talent acquisition|careers|jobs|noreply|no-reply|support|mailer|notification|do[- ]?not[- ]?reply)/g, "")
    .replace(/[^a-z0-9&\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Use first token as brand if reasonable
  const token = cleaned.split(" ")[0] || "";
  return token || cleaned;
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
  // Prefer text/plain
  const plainPart = parts.find((p) => (p.mimeType || "").toLowerCase() === "text/plain");
  if (plainPart && plainPart.body && plainPart.body.data) {
    return decodeBase64Url(plainPart.body.data);
  }
  // Search recursively
  for (const part of parts) {
    if (part.parts && part.parts.length) {
      const nested = getBodyText(part);
      if (nested) return nested;
    }
  }
  // Fallback to text/html
  const htmlPart = parts.find((p) => (p.mimeType || "").toLowerCase() === "text/html");
  if (htmlPart && htmlPart.body && htmlPart.body.data) {
    return stripHtml(decodeBase64Url(htmlPart.body.data));
  }
  // Some messages have body on payload itself
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }
  return "";
}

function extractCompany(fromHeader, subject) {
  const from = (fromHeader || "").toLowerCase();
  const subj = (subject || "").toLowerCase();
  // Try domain as company indicator
  const domainMatch = from.match(/@([a-z0-9.-]+)\b/);
  const domain = domainMatch ? domainMatch[1] : null;
  let companyHint = null;
  if (domain) {
    companyHint = domain.split(".")[0];
  }
  // fallback: first capitalized word in subject
  const titleWord = (subject || "").match(/\b([A-Z][a-zA-Z0-9&]+)/);
  if (!companyHint && titleWord) companyHint = titleWord[1].toLowerCase();
  // prefer display name leading token
  if (!companyHint) {
    const display = getDisplayName(fromHeader);
    const sanitized = sanitizeCompanyName(display);
    if (sanitized) companyHint = sanitized;
  }
  return companyHint;
}

async function findMatchingApplication(userId, companyHint, subject) {
  const { rows } = await pool.query(
    "SELECT id, name, description, status FROM applications WHERE user_id=$1",
    [userId]
  );
  const subj = (subject || "").toLowerCase();
  let match = null;
  if (companyHint) {
    match = rows.find((r) => (r.name || "").toLowerCase().includes(companyHint));
  }
  if (!match) {
    // Fallback: subject contains the application name or description keyword
    match = rows.find((r) => {
      const n = (r.name || "").toLowerCase();
      const d = (r.description || "").toLowerCase();
      return (n && subj.includes(n)) || (d && d.length > 0 && subj.includes(d.split(" ")[0]));
    });
  }
  return match || null;
}

function extractInterviewDateTime(text) {
  // Only accept YYYY-MM-DD for date
  const dateMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  const timeMatch = text.match(/\b\d{1,2}:\d{2}\s*(AM|PM)\b/i)
    || text.match(/\b\d{1,2}\s*(AM|PM)\b/i);
  return {
    date: dateMatch ? dateMatch[0] : null,
    time: timeMatch ? timeMatch[0] : null,
  };
}

// POST /api/email/sync?userId=123
router.post("/sync", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const oauth2Client = await getGoogleClientForUser(userId);
    if (!oauth2Client) return res.status(400).json({ error: "No connected Google account" });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    // Allow tuning via query params
    const days = Math.max(1, Math.min(1825, Number(req.query.days) || 365));
    const maxScan = Math.max(50, Math.min(2000, Number(req.query.max) || 500));
    const buildQueries = (d) => {
      const baseKeywords = "application OR applied OR confirmation OR candidate OR position OR role OR job OR opportunity OR interview OR offer OR reject OR declined OR \"not moving forward\" OR \"no longer under consideration\" OR \"not selected\"";
      const atsDomains = "indeed.com OR linkedin.com OR icims.com OR workday.com OR greenhouse.io OR lever.co OR smartrecruiters.com OR workable.com OR jobvite.com OR greenhousemail.io";
      const q1 = [
        `newer_than:${d}d`,
        "(",
        baseKeywords,
        ")",
        `OR from:(${atsDomains})`,
      ].join(" ");
      // Fallback broader query: include anywhere and wider keyword net
      const q2 = [
        `in:anywhere newer_than:${Math.min(d * 2, 1825)}d`,
        "(",
        baseKeywords,
        "OR hiring OR next steps OR consideration OR schedule",
        ")",
      ].join(" ");
      return [q1, q2];
    };
    const queriesUsed = [];
    const idSet = new Set();
    for (const q of buildQueries(days)) {
      queriesUsed.push(q);
      let pageToken = undefined;
      do {
        const list = await gmail.users.messages.list({ userId: "me", q, maxResults: 200, pageToken });
        (list.data.messages || []).forEach((m) => idSet.add(m.id));
        pageToken = list.data.nextPageToken;
      } while (pageToken && idSet.size < maxScan);
      if (idSet.size >= maxScan) break;
    }
    const ids = Array.from(idSet);
    let processed = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let matched = 0;
    let updateAttempts = 0;
    let updateBlockedPrecedence = 0;
    let updateNoChange = 0;
    let creationErrors = 0;
    const reasonCounts = { non_job: 0, low_confidence: 0, duplicate: 0 };
    for (const id of ids) {
      const msg = await gmail.users.messages.get({ userId: "me", id });
      const payload = msg.data.payload || {};
      const headers = payload.headers || [];
      const header = (name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || null;
      const subject = header("Subject") || "";
      const from = header("From") || "";
      const messageId = header("Message-Id") || header("Message-ID") || null;
      const snippet = msg.data.snippet || "";
      const bodyText = getBodyText(payload);
      const attachments = getAttachmentTypes(payload);
      // Filter out obvious non-job emails
      if (!isLikelyJobEmail({ subject, body: bodyText, from })) {
        skipped += 1; reasonCounts.non_job += 1;
        console.log(`[SKIP] Non-job email:`, { id, subject, from });
        continue;
      }
      // Scoring-based classification
      const domain = getDomainFromFromHeader(from);
      const { status, confidence } = scoreEmailStatus({ text: `${subject} ${bodyText}`, domain, attachments });
      if (!status || confidence < 0.05) {
        skipped += 1; reasonCounts.low_confidence += 1;
        console.log(`[SKIP] Low confidence:`, { id, subject, from, status, confidence });
        continue;
      }
      // Deduplicate by Gmail message id (stored as email_id)
      {
        const { rows: dupRows } = await pool.query(
          "SELECT 1 FROM application_status_updates WHERE email_id=$1 LIMIT 1",
          [id]
        );
        if (dupRows.length > 0) { skipped += 1; reasonCounts.duplicate += 1; continue; }
      }
      const companyHint = extractCompany(from, subject);
      let application = await findMatchingApplication(userId, companyHint, subject);
      const details = extractDetails(subject, bodyText, from);
      if (!application) {
        // Create a new application if none matched
        const inferredName = (details.company || companyHint || "").trim() || (subject || "").split("-")[0].trim() || "Unknown Company";
        const inferredDesc = (details.role ? `${details.role} — ` : "") + (subject || "").trim();
        try {
          console.log(`[CREATE] Attempting to create application:`, { userId, inferredName, inferredDesc, status });
          const insertRes = await pool.query(
            "INSERT INTO applications (user_id, name, description, status, interview_date, interview_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, status",
            [userId, inferredName, inferredDesc, status, null, null]
          );
          application = insertRes.rows[0];
          created += 1;
          console.log(`[CREATE] Success:`, application);
        } catch (e) {
          creationErrors += 1;
          skipped += 1;
          console.error(`[CREATE] Error:`, e?.message || e);
          continue;
        }
      } else {
        matched += 1;
      }
      const when = extractInterviewDateTime(`${subject} ${snippet} ${bodyText}`);
      // Log every processed email
      console.log(`[PROCESS] Email:`, { id, subject, from, status, confidence, interview_date: when.date, interview_time: when.time });
      // Update application status if precedence allows, and interview details
      const existingStatus = application.status || null;
      updateAttempts += 1;
      if (shouldUpdateStatus(existingStatus, status, confidence)) {
        const updRes = await pool.query(
          "UPDATE applications SET status=$1, interview_date=COALESCE($2, interview_date), interview_time=COALESCE($3, interview_time) WHERE id=$4",
          [status, when.date, when.time, application.id]
        );
        if ((updRes.rowCount || 0) > 0) {
          updated += 1;
        } else {
          updateNoChange += 1;
        }
      } else {
        updateBlockedPrecedence += 1;
      }
      const snippetToStore = (bodyText || snippet || "").slice(0, 500);
      await pool.query(
        `INSERT INTO application_status_updates (application_id, status, email_id, subject, body_snippet, occurred_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [application.id, status, id, subject, snippetToStore]
      );
      processed += 1;
    }
    res.json({ processed, total: ids.length, created, updated, skipped, matched, updateAttempts, updateBlockedPrecedence, updateNoChange, creationErrors, reasonCounts, queriesUsed, scanWindowDays: days });
  } catch (err) {
    console.error("Email sync error:", err);
    res.status(500).json({ error: "Failed to sync emails" });
  }
});

// GET /api/email/status?userId=123
router.get("/status", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  if (!process.env.DATABASE_URL) {
    return res.json({ connectedProviders: [] });
  }
  try {
    const { rows } = await pool.query(
      "SELECT provider FROM email_accounts WHERE user_id=$1",
      [userId]
    );
    res.json({ connectedProviders: rows.map((r) => r.provider) });
  } catch (err) {
    console.error("Email status error:", err);
    res.status(500).json({ error: "Failed to fetch email status" });
  }
});

// DELETE /api/email/google?userId=123
router.delete("/google", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  if (!process.env.DATABASE_URL) {
    return res.status(400).json({ error: "Database not configured" });
  }
  try {
    await pool.query(
      "DELETE FROM email_accounts WHERE user_id=$1 AND provider='google'",
      [userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Email disconnect error:", err);
    res.status(500).json({ error: "Failed to disconnect Google" });
  }
});

module.exports = router;
