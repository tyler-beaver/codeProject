/**
 * Registration form for the React frontend
 */
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    // Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      // Match any error message that indicates the email is already taken
      const msg = error.message ? error.message.toLowerCase() : "";
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("email already in use") ||
        msg.includes("user already exists")
      ) {
        setError(
          "An account with this email already exists. Please sign in or use a different email.",
        );
      } else {
        setError(error.message);
      }
      setShowSuccess(false);
      return;
    }
    // Only show success if a user object is returned AND identities array is not empty (new user)
    if (
      data &&
      data.user &&
      data.user.identities &&
      data.user.identities.length > 0
    ) {
      setShowSuccess(true);
    } else {
      setError(
        "An account with this email already exists. Please sign in or use a different email.",
      );
      setShowSuccess(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.imageBg}>
          <div style={styles.brandSection}>
            <div style={styles.brandIcon}>📝</div>
            <h2 style={styles.brandName}>JobTracker</h2>
            <p style={styles.brandDesc}>Start tracking your dream jobs.</p>
            <div style={{ marginTop: 32 }}>
              <svg
                width="120"
                height="80"
                viewBox="0 0 120 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="10"
                  y="20"
                  width="100"
                  height="40"
                  rx="10"
                  fill="#3b82f6"
                  opacity="0.12"
                />
                <rect
                  x="25"
                  y="35"
                  width="70"
                  height="10"
                  rx="5"
                  fill="#3b82f6"
                  opacity="0.18"
                />
              </svg>
            </div>
          </div>
          <div style={styles.overlayCard}>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>
              Join a growing community of job seekers.
            </p>
            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                  <span
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 16,
                      cursor: "pointer",
                    }}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              {error && (
                <div
                  style={{
                    position: "fixed",
                    top: "20%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#fee2e2",
                    color: "#991b1b",
                    padding: "18px 28px",
                    borderRadius: 12,
                    fontSize: "1.05rem",
                    border: "2px solid #fecaca",
                    zIndex: 3000,
                    boxShadow: "0 4px 24px 0 rgba(220,38,38,0.13)",
                    minWidth: 260,
                    maxWidth: 400,
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  <span
                    onClick={() => setError("")}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 12,
                      cursor: "pointer",
                      fontWeight: 900,
                      fontSize: "1.2rem",
                      color: "#991b1b",
                      background: "none",
                      border: "none",
                    }}
                    aria-label="Close error popup"
                  >
                    ×
                  </span>
                  {error}
                </div>
              )}
              <button
                type="submit"
                style={styles.button}
                onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
                onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
              >
                Create Account
              </button>
            </form>
            <p style={styles.footer}>
              Already have an account?{" "}
              <Link to="/login" style={styles.link}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 8px 32px 0 rgba(59,130,246,0.13)",
              padding: "48px 48px 36px 48px",
              minWidth: 340,
              maxWidth: 400,
              width: "100%",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
              position: "relative",
              border: "1.5px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#16a34a" }}>Account Created!</h2>
            <p style={{ color: "#475569", marginBottom: 24 }}>
              Please check your email and verify your account before signing in.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                navigate("/login");
              }}
              style={{
                marginTop: 8,
                background: "#3b82f6",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "1.05rem",
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "calc(100vh - 64px)",
    background: "#fff",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
  },
  leftPanel: {
    flex: 1,
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minWidth: "320px",
    overflow: "hidden",
  },
  imageBg: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  overlayCard: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 8px 32px 0 rgba(59,130,246,0.13)",
    padding: "56px 64px 48px 64px",
    minWidth: "520px",
    maxWidth: "99vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
    border: "1.5px solid #e5e7eb",
  },
  brandSection: {
    textAlign: "center",
    color: "#fff",
  },
  brandIcon: {
    fontSize: "2.8rem",
    marginBottom: "12px",
  },
  brandName: {
    fontSize: "2rem",
    fontWeight: 900,
    margin: "0 0 12px 0",
  },
  brandDesc: {
    fontSize: "1rem",
    color: "#dbeafe",
    margin: 0,
  },
  rightPanel: {
    flex: 1.3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 8px 32px 0 rgba(59,130,246,0.10)",
    padding: "40px 32px 32px 32px",
    margin: "32px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: "0 0 32px 0",
  },
  form: {
    marginBottom: "24px",
  },
  formGroup: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "8px",
  },
  input: {
    width: "380px",
    maxWidth: "100%",
    padding: "16px 18px",
    fontSize: "1.08rem",
    border: "1.5px solid #cbd5e1",
    borderRadius: "10px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.2s",
    outline: "none",
    background: "#f8fafc",
    marginBottom: "2px",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "0.9rem",
    border: "1px solid #fecaca",
  },
  button: {
    width: "100%",
    padding: "14px 0",
    fontSize: "1.08rem",
    fontWeight: 700,
    background: "linear-gradient(90deg,#2563eb,#3b82f6)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 2px 8px 0 rgba(59,130,246,0.10)",
    transition: "all 0.2s",
    marginTop: "8px",
  },
  footer: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#64748b",
    margin: 0,
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 700,
    cursor: "pointer",
    transition: "color 0.3s ease",
  },
};

export default Register;
