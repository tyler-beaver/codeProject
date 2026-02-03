# Project Overview: JobTracker Login System

## Full Stack Breakdown

### Frontend

- **Framework:** React (with functional components and hooks)
- **Styling:** Inline styles, Tailwind CSS (config present), and shared style modules
- **Routing:** React Router (SPA navigation)
- **UI Features:**
  - Registration, Login, Password Reset, and Email Confirmation flows
  - Show/hide password toggles (react-icons)
  - Popups and overlays for success/error feedback
  - Responsive, modern design

### Backend

- **Platform:** Node.js
- **Structure:**
  - `index.js`: Main server entry
  - `routes/`: Express route modules for auth, applications, enrichment
  - `db.js`: Database connection logic
  - `email.js`: Email sending logic (custom SMTP)
  - `utils/`: Utility functions
- **Auth:** Delegated to Supabase (no custom password logic in backend)

### Authentication & User Management

- **Provider:** Supabase Auth
  - Handles registration, login, password reset, and email confirmation
  - Custom email templates for confirmation and recovery
  - Uses magic links and email/password
- **Frontend Integration:**
  - Uses `@supabase/supabase-js` for all auth actions
  - Handles all error/success UI, including duplicate email detection

### Why This Architecture?

- **Supabase for Auth:**
  - Offloads security, password storage, and email flows to a trusted provider
  - Allows custom email templates and redirects
  - Simplifies backend (no need to handle password hashing or email sending for auth)
- **React SPA:**
  - Fast, modern user experience
  - Easy to manage state and navigation
  - Enables popups and overlays for better UX
- **Custom Backend:**
  - Handles business logic, job application data, and enrichment
  - Keeps sensitive logic server-side, but leaves auth to Supabase

### Key Implementation Decisions

- **Error Handling:**
  - Frontend robustly checks Supabase responses (e.g., duplicate email logic checks `user.identities`)
  - Popups for errors/success to avoid layout shifts and make feedback obvious
- **Email Confirmation:**
  - Custom confirmation page at `/email-confirmed` for clear user feedback
  - Home page detects `redirect_to` param to show confirmation popup even if redirected to root
- **Password Reset:**
  - Custom reset and change password flows, with clear error/success feedback
- **UI/UX:**
  - Show/hide password icons for all password fields
  - All error messages are dismissible overlays

### How to Extend or Modify

- **Add more pages:** Create new React components and add routes in `App.js`
- **Change auth provider:** Replace Supabase logic in frontend and backend
- **Add more backend features:** Add new Express routes and connect to your database
- **Change email templates:** Update in Supabase dashboard and/or backend email logic

### Summary

This project is a modern, full-stack job tracking system with robust authentication, clear user feedback, and a clean separation of concerns. Supabase handles all authentication and email flows, React provides a responsive SPA frontend, and Node.js/Express powers the backend business logic.

---
