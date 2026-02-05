import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import {
  sharedFont,
  sharedBox,
  sharedButton,
  sharedInput,
} from "../styles/shared";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Store token from URL for local testing
  const [token, setToken] = useState("");

  useEffect(() => {
    // 1️⃣ Check for PASSWORD_RECOVERY event from Supabase redirect
    const { subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowForm(true);
      }
    });

    // 2️⃣ Check for session on mount (page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setShowForm(true);
    });

    // 3️⃣ Support both query param and hash fragment for token
    const params = new URLSearchParams(window.location.search);
    let tokenFromURL = params.get("token");
    if (!tokenFromURL && window.location.hash) {
      // Parse hash fragment for access_token
      const hashParams = new URLSearchParams(window.location.hash.slice(1).replace(/&/g, "&"));
      tokenFromURL = hashParams.get("access_token");
    }
    if (tokenFromURL) {
      setToken(tokenFromURL);
      setShowForm(true);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    let updateError;
    if (token) {
      // Use Supabase endpoint for password recovery with token
      const { error } = await supabase.auth.api.updateUser(token, { password });
      updateError = error;
    } else {
      const { error } = await supabase.auth.updateUser({ password });
      updateError = error;
    }

    if (updateError) {
      setMessage("Reset failed: " + updateError.message);
    } else {
      setMessage("Password reset! You can now log in.");
      setShowForm(false);
    }

    setLoading(false);
  };

  return (
    <div
      style={{ ...sharedBox, maxWidth: 400, margin: "40px auto", padding: 32 }}
    >
      <h2 style={{ fontFamily: sharedFont }}>Reset Password</h2>

      {showForm ? (
        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={sharedInput}
            />
            <span
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: 16,
                cursor: "pointer",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={sharedInput}
            />
            <span
              onClick={() => setShowConfirm((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: 16,
                cursor: "pointer",
              }}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" disabled={loading} style={sharedButton}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      ) : (
        !message && null
      )}

      {message && (
        <div
          style={{
            marginTop: 16,
            color: message.includes("!") ? "green" : "red",
            fontFamily: sharedFont,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
