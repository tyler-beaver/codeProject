import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ForgotPassword from "../components/ForgotPassword";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    // Login with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else if (data && data.session) {
      localStorage.setItem("token", data.session.access_token);
      setToken(data.session.access_token);
      navigate("/dashboard");
    } else {
      setError("Login failed: no session returned.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.imageBg}>
          <div style={styles.brandSection}>
            <div style={styles.brandIcon}>🔒</div>
            <h2 style={styles.brandName}>JobTracker</h2>
            <p style={styles.brandDesc}>Your job search, organized.</p>
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
            <h1 style={styles.title}>Sign In</h1>
            <p style={styles.subtitle}>
              Welcome back! Log in to your dashboard.
            </p>
            <form onSubmit={handleLogin} style={styles.form}>
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
              {error && <div style={styles.errorBox}>{error}</div>}
              <button
                type="submit"
                style={styles.button}
                onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
                onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
              >
                Sign In
              </button>
            </form>
            <div
              style={{ textAlign: "right", width: "100%", marginBottom: 12 }}
            >
              <button
                onClick={() => setShowForgot(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>
            {showForgot && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.2)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: 32,
                    minWidth: 320,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => setShowForgot(false)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 14,
                      background: "none",
                      border: "none",
                      fontSize: 20,
                      color: "#64748b",
                      cursor: "pointer",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h3 style={{ marginTop: 0 }}>Reset your password</h3>
                  <ForgotPassword
                    onSent={() => {
                      setShowForgot(false);
                      setShowSent(true);
                    }}
                  />
                </div>
              </div>
            )}
            {showSent && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.2)",
                  zIndex: 1100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: 32,
                    minWidth: 320,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => setShowSent(false)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 14,
                      background: "none",
                      border: "none",
                      fontSize: 20,
                      color: "#64748b",
                      cursor: "pointer",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h3 style={{ marginTop: 0, color: "#16a34a" }}>
                    Email Sent!
                  </h3>
                  <p style={{ color: "#475569" }}>
                    If an account exists for that email, a reset link has been
                    sent.
                  </p>
                  <button
                    onClick={() => setShowSent(false)}
                    style={{
                      marginTop: 16,
                      background: "#3b82f6",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 18px",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
            <p style={styles.footer}>
              Don't have an account?{" "}
              <Link to="/register" style={styles.link}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
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
    color: "#cbd5e1",
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
     width: "100%",
    maxWidth: "100%",
     padding: "12px 10px",
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
     padding: "12px 0",
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
    // Responsive media queries
    '@media (max-width: 900px)': {
      overlayCard: {
        padding: "32px 8px 24px 8px",
        minWidth: "0",
        maxWidth: "95vw",
      },
      input: {
        fontSize: "1rem",
        padding: "10px 8px",
      },
      button: {
        fontSize: "1rem",
        padding: "10px 0",
      },
      title: {
        fontSize: "1.3rem",
      },
      subtitle: {
        fontSize: "0.9rem",
      },
    },
    '@media (max-width: 600px)': {
      overlayCard: {
        padding: "16px 4px 12px 4px",
        minWidth: "0",
        maxWidth: "99vw",
      },
      input: {
        fontSize: "0.95rem",
        padding: "8px 6px",
      },
      button: {
        fontSize: "0.95rem",
        padding: "8px 0",
      },
      title: {
        fontSize: "1rem",
      },
      subtitle: {
        fontSize: "0.85rem",
      },
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

export default Login;
