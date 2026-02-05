import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
// ...existing code...
import ChangePassword from "../components/ChangePassword";

function Profile() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const gmailJustConnected = params.get("connected") === "google";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        setUser(data.user);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchEmailStatus = async () => {
      if (!user) return;
      try {
        const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
        const resp = await fetch(`${backend}/api/email/status?userId=${encodeURIComponent(user.id)}`);
        const data = await resp.json();
        setEmailStatus(data || { connectedProviders: [] });
      } catch (e) {
        console.error("Fetch email status error", e);
      }
    };
    fetchEmailStatus();
  }, [user]);

  // ...existing code...
  const [showChange, setShowChange] = useState(false);
  const [showChanged, setShowChanged] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ connectedProviders: [] });
  const connectGmail = async () => {
    if (!user) return;
    try {
      setConnecting(true);
      const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
      const resp = await fetch(`${backend}/api/email/google/url?userId=${encodeURIComponent(user.id)}`);
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Google consent
      } else if (data.error) {
        alert(`Cannot start Google connect: ${data.error}.\n` +
              (data.hint ? `Hint: ${data.hint}` : ""));
      }
    } catch (e) {
      console.error("Connect Gmail error", e);
      alert("Failed to start Google connect. See console for details.");
    } finally {
      setConnecting(false);
    }
  };
  const disconnectGmail = async () => {
    if (!user) return;
    try {
      const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
      const resp = await fetch(`${backend}/api/email/google?userId=${encodeURIComponent(user.id)}`, { method: "DELETE" });
      const data = await resp.json();
      if (data && data.success) {
        setEmailStatus((s) => ({ connectedProviders: (s.connectedProviders || []).filter((p) => p !== "google") }));
      } else {
        alert("Failed to disconnect Google");
      }
    } catch (e) {
      console.error("Disconnect Gmail error", e);
      alert("Failed to disconnect Google. See console for details.");
    }
  };
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {gmailJustConnected && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.18)",
              zIndex: 3000,
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
                fontFamily: "inherit",
                position: "relative",
                border: "1.5px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#16a34a" }}>Gmail Connected!</h2>
              <p style={{ color: "#475569", marginBottom: 24, fontSize: "1.08rem" }}>
                Your Gmail account has been successfully connected.<br />
                You can now sync job application emails.
              </p>
              <button
                  onClick={async () => {
                    // Remove ?connected=google from the URL without reloading
                    window.history.replaceState(null, '', 'https://tyler-beaver.github.io/codeProject/#/profile');
                    // Force refresh email status after Gmail connection
                    if (user) {
                      try {
                        const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
                        const resp = await fetch(`${backend}/api/email/status?userId=${encodeURIComponent(user.id)}`);
                        const data = await resp.json();
                        setEmailStatus(data || { connectedProviders: [] });
                      } catch (e) {
                        console.error("Fetch email status error", e);
                      }
                    }
                    window.location.replace('https://tyler-beaver.github.io/codeProject/#/profile');
                  }}
                style={{
                  marginTop: 8,
                  background: "linear-gradient(90deg,#2563eb,#3b82f6)",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 24px",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "1.05rem",
                  textDecoration: "none",
                  boxShadow: "0 2px 8px 0 rgba(59,130,246,0.10)",
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "#991b1b", fontWeight: 600 }}>{error}</div>
        ) : user ? (
          <>
            <div style={styles.avatarSection}>
              <div style={styles.avatar}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="32" cy="32" r="32" fill="#2563eb" />
                  <circle cx="32" cy="26" r="12" fill="#fff" />
                  <ellipse cx="32" cy="48" rx="18" ry="10" fill="#fff" />
                </svg>
              </div>
              <h2 style={styles.name}>{user.username || user.name}</h2>
              <p style={styles.email}>{user.email}</p>
              <button
                onClick={() => setShowChange(true)}
                style={{
                  marginTop: 16,
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Change Password
              </button>
              <div style={{ marginTop: 12 }}>
                {emailStatus.connectedProviders?.includes("google") ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>Google connected</span>
                    <button
                      onClick={disconnectGmail}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectGmail}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    disabled={connecting}
                  >
                    {connecting ? "Connecting..." : "Connect Gmail"}
                  </button>
                )}
              </div>
            </div>
            {showChange && (
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
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Change your password</h3>
                  <ChangePassword
                    onClose={() => setShowChange(false)}
                    onSuccess={() => {
                      setShowChange(false);
                      setShowChanged(true);
                    }}
                  />
                </div>
              </div>
            )}
            {showChanged && (
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
                    onClick={() => setShowChanged(false)}
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
                    Password Changed!
                  </h3>
                  <p style={{ color: "#475569" }}>
                    Your password was changed successfully.
                  </p>
                  <button
                    onClick={() => setShowChanged(false)}
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
            <div style={styles.infoSection}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Joined:</span>
                <span style={styles.infoValue}>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: "40px 0",
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 8px 32px 0 rgba(59,130,246,0.10)",
    padding: "48px 40px 40px 40px",
    minWidth: "380px",
    maxWidth: "95vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "32px",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "rgba(37,99,235,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  name: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  email: {
    fontSize: "1rem",
    color: "#64748b",
    margin: "8px 0 0 0",
  },
  infoSection: {
    width: "100%",
    marginTop: "16px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "1.05rem",
  },
  infoLabel: {
    color: "#64748b",
    fontWeight: 500,
  },
  infoValue: {
    color: "#0f172a",
    fontWeight: 600,
  },
};

export default Profile;
