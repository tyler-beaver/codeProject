import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function ForgotPassword({ onSent }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    // Use GitHub Pages URL for Supabase password reset
    const redirectUrl = "https://tyler-beaver.github.io/codeProject/#/reset-password";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) {
      setMessage("Failed to send reset email: " + error.message);
    } else {
      setMessage("Check your email for a reset link.");
      if (onSent) onSent();
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
        width: 260,
        maxWidth: "100%",
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 8px 32px 0 rgba(59,130,246,0.10)",
        padding: "22px 14px 18px 14px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "16px 18px",
            fontSize: "1.08rem",
            border: "1.5px solid #cbd5e1",
            borderRadius: "10px",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition: "all 0.2s",
            outline: "none",
            background: "#f8fafc",
            marginBottom: 20,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
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
            marginTop: 8,
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && (
        <div
          style={{
            marginTop: 16,
            background: message.includes("Check") ? "#dcfce7" : "#fee2e2",
            color: message.includes("Check") ? "#166534" : "#991b1b",
            padding: "12px 14px",
            borderRadius: 8,
            fontSize: "0.98rem",
            border: message.includes("Check")
              ? "1px solid #bbf7d0"
              : "1px solid #fecaca",
            width: "100%",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
