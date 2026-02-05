import React from "react";
import { sharedFont } from "../styles/shared";

function EmailConfirmed() {
  return (
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
          fontFamily: sharedFont,
          position: "relative",
          border: "1.5px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#2563eb" }}>Email Confirmed!</h2>
        <p style={{ color: "#475569", marginBottom: 24, fontSize: "1.08rem" }}>
          Your email has been successfully verified.
          <br />
          You can now log in to your account.
        </p>
        <a
          href="/codeProject/#/login"
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
          Go to Login
        </a>
      </div>
    </div>
  );
}

export default EmailConfirmed;
