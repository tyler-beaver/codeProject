import React from "react";
import { useNavigate } from "react-router-dom";
import { sharedFont, sharedButton } from "../styles/shared";

function Home({ token }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token) {
      navigate("/dashboard");
      return;
    }
    // Check for redirect_to param in URL
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect_to");
    if (redirectTo && redirectTo.endsWith("/email-confirmed")) {
      navigate("/email-confirmed", { replace: true });
    }
  }, [token, navigate]);

  const handleGetStarted = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div style={{ ...styles.container, fontFamily: sharedFont }}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Job Search, Simplified</h1>
          <p style={styles.heroSubtitle}>
            Track, organize, and win your next job. All your applications,
            notes, and reminders in one beautiful, easy-to-use dashboard.
          </p>
          <button
            style={sharedButton}
            onClick={handleGetStarted}
            onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
          >
            {token ? "Go to Dashboard" : "Get Started Free"}
          </button>
          <p style={styles.heroSmallText}>
            No credit card required. Get started in seconds.
          </p>
        </div>
        <div style={styles.heroImage}>
          <div style={styles.mockupCard}>
            <div style={styles.mockupHeader}>
              <div style={styles.mockupDot}></div>
              <div style={styles.mockupDot}></div>
              <div style={styles.mockupDot}></div>
            </div>
            <div style={styles.mockupBody}>
              <div
                style={{
                  ...styles.mockupLine,
                  width: "80%",
                  background: "#3b82f6",
                  height: "14px",
                }}
              />
              <div
                style={{
                  ...styles.mockupLineSmall,
                  width: "60%",
                  background: "#60a5fa",
                }}
              />
              <div
                style={{
                  ...styles.mockupLine,
                  marginTop: "20px",
                  width: "90%",
                  background: "#0ea5e9",
                }}
              />
              <div
                style={{
                  ...styles.mockupLineSmall,
                  width: "70%",
                  marginTop: "8px",
                  background: "#38bdf8",
                }}
              />
              <div
                style={{
                  ...styles.mockupLine,
                  marginTop: "20px",
                  width: "60%",
                  background: "#818cf8",
                }}
              />
              <div
                style={{
                  ...styles.mockupLineSmall,
                  width: "50%",
                  marginTop: "8px",
                  background: "#a5b4fc",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why You'll Love It</h2>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📋</div>
            <h3 style={styles.featureTitle}>All-in-One Tracker</h3>
            <p style={styles.featureDesc}>
              Every job, note, and follow-up in one place. No more spreadsheets.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>Visual Progress</h3>
            <p style={styles.featureDesc}>
              See your application journey at a glance with clear, modern
              visuals.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔔</div>
            <h3 style={styles.featureTitle}>Never Miss a Beat</h3>
            <p style={styles.featureDesc}>
              Smart reminders keep you on top of every opportunity.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Fast & Effortless</h3>
            <p style={styles.featureDesc}>
              A clean, intuitive interface that gets out of your way.
            </p>
          </div>
        </div>
      </section>

      {/* Stats section removed for authenticity */}

      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to land your next job?</h2>
        <p style={styles.ctaSubtitle}>
          Join a growing community of job seekers and get organized today.
        </p>
        <button
          style={{ ...sharedButton, padding: "16px 48px", fontSize: "1.05rem" }}
          onClick={handleGetStarted}
          onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
          onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
        >
          {token ? "Open Dashboard" : "Create Free Account"}
        </button>
      </section>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    background: "#fff",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
  },
  hero: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "100px 32px 80px",
    gap: "60px",
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: "4rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: "0 0 20px 0",
    lineHeight: "1.1",
    background: "linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    color: "#475569",
    margin: "0 0 32px 0",
    lineHeight: "1.7",
    maxWidth: "500px",
    fontWeight: 400,
  },
  heroSmallText: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: "16px 0 0 0",
  },
  heroImage: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  mockupCard: {
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 12px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  mockupHeader: {
    height: "40px",
    background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
    display: "flex",
    gap: "8px",
    padding: "12px 16px",
    boxSizing: "border-box",
  },
  mockupDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#cbd5e1",
  },
  mockupBody: {
    padding: "24px",
  },
  mockupLine: {
    height: "10px",
    background: "#cbd5e1",
    borderRadius: "6px",
    marginBottom: "12px",
  },
  mockupLineSmall: {
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "4px",
    marginBottom: "8px",
  },
  features: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "100px 32px",
    borderTop: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "2.8rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: "0 0 60px 0",
    textAlign: "center",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "32px",
  },
  featureCard: {
    padding: "40px 32px",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  featureIcon: {
    fontSize: "3.5rem",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 12px 0",
  },
  featureDesc: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.6",
  },
  ctaSection: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "100px 32px",
    textAlign: "center",
    borderTop: "1px solid #e2e8f0",
  },
  ctaTitle: {
    fontSize: "2.8rem",
    fontWeight: 900,
    color: "#fff",
    margin: "0 0 16px 0",
  },
  ctaSubtitle: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    margin: "0 0 32px 0",
  },
  ctaButton: {
    padding: "14px 36px",
    fontSize: "1rem",
    fontWeight: 700,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  ctaButtonLarge: {
    padding: "16px 48px",
    fontSize: "1.05rem",
    fontWeight: 700,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  // Responsive media queries
  '@media (max-width: 900px)': {
    hero: {
      flexDirection: "column",
      padding: "60px 16px 40px",
      gap: "32px",
    },
    heroTitle: {
      fontSize: "2.2rem",
    },
    features: {
      padding: "60px 16px",
    },
    sectionTitle: {
      fontSize: "2rem",
    },
    ctaSection: {
      padding: "60px 16px",
    },
    ctaTitle: {
      fontSize: "2rem",
    },
  },
  '@media (max-width: 600px)': {
    hero: {
      flexDirection: "column",
      padding: "32px 8px 24px",
      gap: "16px",
    },
    heroTitle: {
      fontSize: "1.3rem",
    },
    heroSubtitle: {
      fontSize: "1rem",
    },
    features: {
      padding: "32px 8px",
    },
    sectionTitle: {
      fontSize: "1.2rem",
    },
    featureCard: {
      padding: "16px 8px",
    },
    featureIcon: {
      fontSize: "2rem",
    },
    ctaSection: {
      padding: "32px 8px",
    },
    ctaTitle: {
      fontSize: "1.2rem",
    },
    ctaSubtitle: {
      fontSize: "0.9rem",
    },
    ctaButtonLarge: {
      padding: "10px 24px",
      fontSize: "0.95rem",
    },
  },
};

export default Home;
