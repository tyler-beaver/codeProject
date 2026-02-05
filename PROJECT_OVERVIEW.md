
# Tech Stack, Hosting, and Accounts

## Tech Stack
- **Frontend:** React (Create React App), Tailwind CSS, React Router, Supabase JS client
- **Backend:** Node.js, Express, Nodemailer, Google APIs (OAuth2, Gmail), JWT, PostgreSQL (pg)
- **Database:** Supabase (PostgreSQL managed cloud DB)
- **Other:** Axios, dotenv, Postman (for API testing)

## Hosting & Deployment
- **Frontend:** GitHub Pages ([https://tyler-beaver.github.io/codeProject/](https://tyler-beaver.github.io/codeProject/))
- **Backend:** Render ([https://codeproject-1dnl.onrender.com](https://codeproject-1dnl.onrender.com))
- **Database:** Supabase (cloud-hosted Postgres)

## Accounts & Cloud Services
- **GitHub:** tyler-beaver/codeProject (source code, GitHub Pages)
- **Supabase:** Project for Postgres DB and authentication
- **Google Cloud:** OAuth 2.0 Client for Gmail integration (APIs & Services > Credentials)
- **Render:** Node.js backend hosting


## What’s New
- **Gmail Connect + Sync:** Users can link Gmail and automatically import job-related emails. The system classifies Applied, Interview, Rejected, Offer and can auto-create or update applications.
- **Smart Classification:** Combines sender domains (ATS providers), normalized subject/body keywords, attachments, and a scoring model with confidence and status precedence.
- **Diagnostics:** Sync response returns processed totals, created/updated counts, skipped reasons, and queries used for transparency.
- **Security & Stability:** Nodemailer upgraded; dev safeguards added for missing SMTP/DB; schema ensured idempotently at startup.

## Architecture

### Backend
- **Entry:** [login-system/backend/index.js](login-system/backend/index.js)
- **Routes:**
  - Auth: [login-system/backend/routes/auth.js](login-system/backend/routes/auth.js)
  - Applications: [login-system/backend/routes/applications.js](login-system/backend/routes/applications.js)
  - Enrichment: [login-system/backend/routes/enrich.js](login-system/backend/routes/enrich.js)
  - Email (Gmail OAuth + Sync): [login-system/backend/routes/email.js](login-system/backend/routes/email.js)
- **SMTP Transport:** [login-system/backend/email.js](login-system/backend/email.js) for password reset emails.
- **DB:** [login-system/backend/db.js](login-system/backend/db.js) Postgres pool (Supabase).

### Frontend
- **Entry:** [login-system/frontend/src/index.js](login-system/frontend/src/index.js) and [login-system/frontend/src/App.js](login-system/frontend/src/App.js)
- **Supabase Client:** [login-system/frontend/src/supabaseClient.js](login-system/frontend/src/supabaseClient.js)
- **Pages:**
  - Dashboard: [login-system/frontend/src/pages/Dashboard.js](login-system/frontend/src/pages/Dashboard.js)
  - Profile (Connect/Disconnect Gmail): [login-system/frontend/src/pages/Profile.js](login-system/frontend/src/pages/Profile.js)
  - Auth & Reset: Login/Register/ResetPassword/EmailConfirmed

## Gmail Connect & Sync Flow
- Get consent URL: `GET /api/email/google/url?userId=<supabase_user_id>`
- OAuth callback: `GET /api/email/google/callback` stores tokens (per user+provider).
- Sync emails: `POST /api/email/sync?userId=<supabase_user_id>`
  - Optional: `days=<int>` lookback (default 365, max 1825), `max=<int>` cap (default 500, max 2000).
- Status: `GET /api/email/status?userId=<supabase_user_id>`
- Disconnect: `DELETE /api/email/google?userId=<supabase_user_id>`

## Classification & Matching
- **Signals:**
  - ATS/provider domains (Workday, Greenhouse, Lever, SmartRecruiters, ICIMS, etc.)
  - Normalized subject + body phrases (Applied/Interview/Rejected/Offer), including “Next steps”, “Under review”, “Selected another candidate”, “Offer letter attached”
  - Attachments (PDF boosts Offer confidence)
- **Scoring:** Weighted phrases per status; selects highest score with confidence threshold.
- **Precedence:** Avoids regressing statuses (e.g., won’t downgrade from Offer). Strong Offer/Rejected can override equals.
- **Matching:** Infers company from sender display/domain or subject; tries to match existing application by company/keywords; auto-creates if none.

## Database Changes
- Ensured `applications.status` column.
- New tables:
  - `email_accounts (user_id TEXT, provider, tokens, token_expires_at)`
    - Unique index on `(user_id, provider)`
  - `application_status_updates (application_id, status, email_id, subject, body_snippet, occurred_at)`
- Notes:
  - `email_accounts.user_id` is `TEXT` to match Supabase UUIDs.
  - Startup schema checks run idempotently in [login-system/backend/routes/email.js](login-system/backend/routes/email.js).

## Deployment & Hosting

- **Frontend:** Hosted on GitHub Pages at [https://tyler-beaver.github.io/codeProject/](https://tyler-beaver.github.io/codeProject/)
- **Backend:** Hosted on Render at [https://codeproject-1dnl.onrender.com](https://codeproject-1dnl.onrender.com)
- **Database:** Supabase Postgres (cloud-hosted)

## Configuration (.env)
- Backend:
  - `PORT`, `BACKEND_URL`, `FRONTEND_URL`, `JWT_SECRET`
  - `DATABASE_URL` (Supabase Postgres, with `?sslmode=require` for Render)
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (optional; dev-safe)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Frontend:
  - `REACT_APP_BACKEND_URL` (e.g., https://codeproject-1dnl.onrender.com)
  - Supabase keys for direct auth/db access

## Running & Testing (Local Dev)
- Backend:
  1. `cd login-system/backend`
  2. `npm install`
  3. `node index.js`
- Frontend:
  1. `cd login-system/frontend`
  2. `npm install`
  3. `npm start`
- In Profile, connect Gmail; in Dashboard, click “Sync Job Emails”.

## Production Usage
- Visit [https://tyler-beaver.github.io/codeProject/](https://tyler-beaver.github.io/codeProject/) for the live app.
- All API calls route to the Render backend.
- Google OAuth callback is handled at `/api/email/google/callback` on the Render backend (see Google Cloud Console for authorized redirect URIs).
- Database is managed by Supabase; ensure Render DATABASE_URL uses `?sslmode=require` and Supabase allows external connections.

## Sync Diagnostics
- Response includes:
  - `processed`, `total`, `created`, `updated`, `skipped`
  - `matched`, `updateAttempts`, `updateBlockedPrecedence`, `updateNoChange`, `creationErrors`
  - `reasonCounts` (non_job, low_confidence, duplicate)
  - `queriesUsed`, `scanWindowDays`
- Dashboard banner shows totals; can be extended to surface reasons.

## Security & Stability
- Nodemailer upgraded to ^7.x; audit clean.
- Dev guards skip SMTP verify and schema init when env missing.

## Known Limitations / Next Steps
- Review panel for unmatched/skipped emails to manually link or create applications.
- Improved date parsing (ICS invites), periodical auto-sync, additional providers (Outlook, Yahoo).
- Optional NLP classifier (spaCy/HF) for unusual phrasing.

## File Naming Note
- There are two email-related files:
  - SMTP transport: [login-system/backend/email.js](login-system/backend/email.js)
  - Gmail OAuth + sync routes: [login-system/backend/routes/email.js](login-system/backend/routes/email.js)

---
This overview reflects the current end-to-end Gmail sync implementation, classification/matching logic, DB schema, configuration, and usage.
