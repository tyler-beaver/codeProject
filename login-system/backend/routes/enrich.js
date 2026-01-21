const express = require("express");
const router = express.Router();
const pool = require("../db"); // your pg pool

// GET /api/enrich/enriched-users
router.get("/enriched-users", async (req, res) => {
  try {
    // Fetch users from PostgreSQL
    const result = await pool.query("SELECT id, username, email, created_at FROM users");
    const users = result.rows;

    // Return only id, username, email
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
