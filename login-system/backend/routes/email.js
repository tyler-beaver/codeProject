const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

// --------------------------
// SCHEMA SETUP
// --------------------------

async function ensureSchema() {
  if (!process.env.DATABASE_URL) return console.warn("ensureSchema skipped: DATABASE_URL not set");

  await pool.query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT");
  await pool.query("ALTER TABLE email_accounts ADD COLUMN IF NOT EXISTS last_email_id TEXT");
  await pool.query("ALTER TABLE email_accounts ADD COLUMN IF NOT EXISTS last_email_internaldate TEXT");

  try {
    await pool.query(`
      ALTER TABLE email_accounts ALTER COLUMN user_id TYPE TEXT USING user_id::text
    `);
  } catch (e) {}

  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_accounts (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at TIMESTAMP WITH TIME ZONE,
      last_email_id TEXT,
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

ensureSchema().catch((e) => console.error("ensureSchema error:", e));

// --------------------------
// GOOGLE OAUTH HELPERS
// --------------------------

function buildOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.BACKEND_URL || "http://localhost:5001"}/api/email/google/callback`;
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

// --------------------------
// GOOGLE OAUTH ROUTES
// --------------------------

router.get("/google/url", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Missing Google OAuth configuration" });
  }
  const oauth2Client = buildOAuthClient();
  const scopes = ["https://www.googleapis.com/auth/gmail.readonly"];
  const state = signState({ userId });
  const url = oauth2Client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: scopes, state });
  res.json({ url });
});

router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const decoded = verifyState(state);
  if (!decoded || !decoded.userId) return res.status(400).send("Invalid state");
  const userId = decoded.userId;

  try {
    const oauth2Client = buildOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    const expires = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

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
    res.redirect(redirect);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    const redirect = `${process.env.FRONTEND_URL || "http://localhost:3000"}/#/profile?error=oauth_failed`;
    res.redirect(redirect);
  }
});

async function getGoogleClientForUser(userId) {
  const oauth2Client = buildOAuthClient();
  const { rows } = await pool.query("SELECT * FROM email_accounts WHERE user_id=$1 AND provider='google'", [userId]);
  if (!rows.length) return null;
  const acct = rows[0];
  oauth2Client.setCredentials({ access_token: acct.access_token, refresh_token: acct.refresh_token });
  return oauth2Client;
}

// --------------------------
// EMAIL PARSING HELPERS
// --------------------------

function normalizeText(input) {
  return (input || "").toLowerCase().replace(/[\r\n]+/g, " ").replace(/[^a-z0-9&\s]/g, " ").replace(/\s+/g, " ").trim();
}

function getAttachmentTypes(payload) {
  const types = [];
  const walk = (p) => {
    if (!p) return;
    if (p.mimeType) types.push(p.mimeType.toLowerCase());
    if (p.parts && Array.isArray(p.parts)) p.parts.forEach(walk);
  };
  walk(payload);
  return types;
}

const JOB_PROVIDER_DOMAINS = ["indeed.com","linkedin.com","icims.com","workday.com","greenhouse.io","lever.co","smartrecruiters.com","workable.com","jobvite.com","greenhousemail.io"];
const NEGATIVE_TERMS = ["newsletter","digest","blog","promo","promotion","marketing","password","reset your password","2fa","notification","receipt","invoice","order","tracking","shipment","ticket","issue","downtime","incident","viewed your profile","accepted your invitation","invitation","connection","follower","follow","like","comment"];

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

function getBodyText(payload) {
  if (!payload) return "";
  const parts = payload.parts || [];
  const plainPart = parts.find(p => (p.mimeType || "").toLowerCase() === "text/plain");
  if (plainPart && plainPart.body?.data) return Buffer.from(plainPart.body.data.replace(/-/g,"+").replace(/_/g,"/"),"base64").toString("utf8");
  for (const part of parts) {
    if (part.parts && part.parts.length) {
      const nested = getBodyText(part);
      if (nested) return nested;
    }
  }
  const htmlPart = parts.find(p => (p.mimeType || "").toLowerCase() === "text/html");
  if (htmlPart && htmlPart.body?.data) return (htmlPart.body.data ? htmlPart.body.data : "").replace(/<[^>]+>/g,"");
  if (payload.body?.data) return Buffer.from(payload.body.data.replace(/-/g,"+").replace(/_/g,"/"),"base64").toString("utf8");
  return "";
}

// You can keep all your other helpers here like extractDetails, extractCompany, scoreEmailStatus, shouldUpdateStatus, findMatchingApplication, extractInterviewDateTime, etc.

// --------------------------
// GMAIL SYNC FUNCTION
// --------------------------

async function syncGmailEmailsForUser(userId) {
  const oauthClient = await getGoogleClientForUser(userId);
  if (!oauthClient) return console.warn("No Google account linked for user", userId);
  const gmail = google.gmail({ version: "v1", auth: oauthClient });


  const { rows: acctRows } = await pool.query(
    "SELECT last_email_id, last_email_internaldate FROM email_accounts WHERE user_id=$1 AND provider='google'",
    [userId]
  );
  const lastEmailId = acctRows[0]?.last_email_id || null;
  const lastEmailInternalDate = acctRows[0]?.last_email_internaldate || null;

  async function fetchWithRetry(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try { return await fn(); } 
      catch(e){ if(i===retries-1) throw e; await new Promise(r=>setTimeout(r, delay*Math.pow(2,i))); }
    }
  }


  let messages = [];
  try {
    // Gmail 'after:' only works with epoch seconds (internalDate), not message ID
    let q = undefined;
    if (lastEmailInternalDate) {
      const afterEpoch = Math.floor(Number(lastEmailInternalDate) / 1000);
      q = `after:${afterEpoch}`;
    }
    const listRes = await fetchWithRetry(() =>
      gmail.users.messages.list({
        userId: "me",
        maxResults: 200,
        ...(q ? { q } : {}),
      })
    );
    messages = listRes.data.messages || [];
    console.log("[SYNC] Gmail fetched message IDs:", messages.map(m => m.id));
  } catch (e) { console.error("Failed to list Gmail messages:", e.message||e); return; }


  if (!messages.length) return console.log("No new emails to process");
  let skipped = 0, reasonCounts = { low_confidence:0, missing_body:0, non_job:0 };
  let newestEmailId = messages[0].id;
  let newestInternalDate = null;


  for (const msg of messages) {
    let detail;
    try { detail = await fetchWithRetry(() => gmail.users.messages.get({ userId:"me", id:msg.id })); }
    catch(e){ console.error("Failed to fetch Gmail message:", e.message||e); skipped++; continue; }

    const payload = detail.data.payload||{};
    const headers = payload.headers||[];
    const subject = headers.find(h=>h.name.toLowerCase()==="subject")?.value||"";
    const from = headers.find(h=>h.name.toLowerCase()==="from")?.value||"";
    const bodyText = getBodyText(payload);
    const attachments = getAttachmentTypes(payload);
    const domain = getDomainFromFromHeader(from);
    const internalDate = detail.data.internalDate;
    if (!newestInternalDate || (internalDate && Number(internalDate) > Number(newestInternalDate))) {
      newestInternalDate = internalDate;
    }

    console.log(`[SYNC] Processing email:`, { id: msg.id, subject, from });

    if(!isLikelyJobEmail({ subject, body:bodyText, from })){
      skipped++; reasonCounts.non_job++;
      console.log(`[SYNC] Skipped non-job email:`, { id: msg.id, subject, from });
      continue;
    }
    if(!bodyText){
      skipped++; reasonCounts.missing_body++;
      console.log(`[SYNC] Skipped missing body:`, { id: msg.id, subject, from });
      continue;
    }

    let { status, confidence } = scoreEmailStatus({ text:`${subject} ${bodyText}`, domain, attachments });
    if(!status || confidence<0.5){
      skipped++; reasonCounts.low_confidence++;
      console.log(`[SYNC] Skipped low confidence:`, { id: msg.id, subject, from, status, confidence });
      continue;
    }

    const details = extractDetails(subject, bodyText, from);
    const interview = extractInterviewDateTime(bodyText);

    let application = await findMatchingApplication(userId, details.company, subject);
    if(!application){
      try {
        const insertRes = await pool.query(
          "INSERT INTO applications (user_id,name,description,status,interview_date,interview_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
          [userId, details.company||"Unknown Company", details.role||subject, status, interview.date, interview.time]
        );
        application = insertRes.rows[0];
        console.log(`[SYNC] Created new application:`, { id: application.id, company: details.company, role: details.role, status });
      } catch(e){ console.error("Failed to create application:", e.message||e); skipped++; continue; }
    }

    if(shouldUpdateStatus(application.status,status,confidence)){
      await pool.query(
        "UPDATE applications SET status=$1,interview_date=COALESCE($2,interview_date),interview_time=COALESCE($3,interview_time) WHERE id=$4",
        [status, interview.date, interview.time, application.id]
      );
      console.log(`[SYNC] Updated application status:`, { id: application.id, status });
    }

    await pool.query(
      `INSERT INTO application_status_updates (application_id,status,source,email_id,subject,body_snippet,occurred_at)
       VALUES ($1,$2,'email',$3,$4,$5,NOW())`,
      [application.id, status, msg.id, subject, bodyText.slice(0,200)]
    );
    console.log(`[SYNC] Added status update for application:`, { applicationId: application.id, status });
  }

  if(newestEmailId && newestInternalDate){
    await pool.query(
      "UPDATE email_accounts SET last_email_id=$1, last_email_internaldate=$2 WHERE user_id=$3 AND provider='google'",
      [newestEmailId, newestInternalDate, userId]
    );
  }

  console.log(`Sync complete. Processed ${messages.length}, skipped ${skipped}`, reasonCounts);
}

// --------------------------
// SYNC ROUTE
// --------------------------

router.post("/sync", async (req, res) => {
  const { userId } = req.query;
  if(!userId) return res.status(400).json({ error:"userId required" });
  try {
    await syncGmailEmailsForUser(userId);
    res.json({ success:true, message:"Emails synced. Check server logs for details." });
  } catch(err){
    console.error("Email sync error:", err);
    res.status(500).json({ error:"Failed to sync emails" });
  }
});

// --------------------------
// OTHER ROUTES
// --------------------------

router.get("/status", async (req,res)=>{
  const { userId } = req.query;
  if(!userId) return res.status(400).json({error:"userId required"});
  try {
    const { rows } = await pool.query("SELECT provider FROM email_accounts WHERE user_id=$1",[userId]);
    res.json({ connectedProviders: rows.map(r=>r.provider) });
  } catch(err){
    console.error("Email status error:",err);
    res.status(500).json({ error:"Failed to fetch email status" });
  }
});

router.delete("/google", async (req,res)=>{
  const { userId } = req.query;
  if(!userId) return res.status(400).json({ error:"userId required" });
  try {
    await pool.query("DELETE FROM email_accounts WHERE user_id=$1 AND provider='google'",[userId]);
    res.json({ success:true });
  } catch(err){
    console.error("Email disconnect error:", err);
    res.status(500).json({ error:"Failed to disconnect Google" });
  }
});

module.exports = router;
