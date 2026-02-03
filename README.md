# codeProject

Creating simple project components to test skills
codeProject504$ database password

link job postings to account work on accuracy, host on github


## Email Sync (Gmail)

The app can connect to a user's Gmail account and auto-detect job-related emails (application confirmations, interviews, rejections, offers). Detected emails are matched to existing applications and status/interview details are populated.

### Backend setup
- Set environment variables (e.g. in a `.env` file under `login-system/backend`):

```
PORT=5001
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=replace_with_a_secret
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Nodemailer (optional, only if you use password emails)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=example
EMAIL_PASS=example

# Google OAuth (Gmail)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5001/api/email/google/callback
```

- Install deps and run backend:

```
cd login-system/backend
npm install
node index.js
```

The backend initializes schema:
- Adds `status` column to `applications` (if missing)
- Creates `email_accounts` and `application_status_updates` tables

### Frontend setup
- Set the backend URL for the frontend:

```
cd login-system/frontend
echo "REACT_APP_BACKEND_URL=http://localhost:5001" > .env
npm install
npm start
```

### Usage
- In the Profile page, click “Connect Gmail” and complete the Google consent flow.
- In the Dashboard, click “Sync Job Emails” to fetch recent emails and update application statuses/interview details.

### Notes
- Matching uses simple heuristics based on sender/subject text. Ensure your application `name` aligns with the company name to improve matching.
- Interview date/time extraction is best-effort; you can adjust values manually in the Dashboard.

