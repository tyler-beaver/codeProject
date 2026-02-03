const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../email");

// Change password (authenticated)
router.post("/change-password", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Old and new password required" });
  }
  try {
    // Get user
    const userRes = await pool.query("SELECT * FROM users WHERE id=$1", [
      userId,
    ]);
    if (userRes.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    const user = userRes.rows[0];
    // Check old password
    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match)
      return res.status(400).json({ error: "Current password is incorrect" });
    // Get all password hashes from last 60 days
    const historyRes = await pool.query(
      `SELECT password_hash FROM password_history WHERE user_id=$1 AND created_at > NOW() - INTERVAL '60 days'`,
      [userId],
    );
    // Also check current password
    const allHashes = [
      user.password_hash,
      ...historyRes.rows.map((r) => r.password_hash),
    ];
    for (const hash of allHashes) {
      if (await bcrypt.compare(newPassword, hash)) {
        return res
          .status(400)
          .json({ error: "You cannot reuse a recent password" });
      }
    }
    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    // Update user password
    await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [
      newHash,
      userId,
    ]);
    // Insert into password history
    await pool.query(
      "INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)",
      [userId, newHash],
    );
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});
/*
    Authentication routes for the backend

    - Handles user registration and login
    - Hashes passwords securely with bcrypt
    - Generates JWT tokens for authenticated sessions
    - Interacts with the database via the shared pool (db.js)
*/
// Request password reset (send email)
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (userRes.rows.length === 0)
      return res.status(400).json({ error: "User not found" });
    const user = userRes.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    const updateResult = await pool.query(
      "UPDATE users SET reset_token=$1, reset_token_expires=NOW() + INTERVAL '30 minutes' WHERE id=$2 RETURNING reset_token, reset_token_expires",
      [token, user.id],
    );
    console.log("Reset token update result:", updateResult.rows);
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      text: `Reset your password: ${resetUrl}`,
    });
    res.json({ message: "Reset email sent" });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: "Token and password required" });
  try {
    console.log("Reset request:", { token, password });
    const userRes = await pool.query(
      "SELECT * FROM users WHERE reset_token=$1 AND reset_token_expires > NOW()",
      [token],
    );
    console.log("User found for reset:", userRes.rows);
    if (userRes.rows.length === 0)
      return res.status(400).json({ error: "Invalid or expired token" });
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2",
      [hashed, userRes.rows[0].id],
    );
    res.json({ message: "Password updated" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please provide all fields" });
  }

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword],
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "User registration failed" });
  }
});

router.post("/login", async (req, res) => {
  console.log("Login request body:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Middleware to verify JWT and attach user to request
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// GET /api/auth/profile - get current user's profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id=$1",
      [req.user.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});
// Request password reset (send email)

module.exports = router;
