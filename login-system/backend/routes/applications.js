const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all applications for a user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, name, description, created_at FROM applications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new application for a user
router.post("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO applications (user_id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description, created_at",
      [userId, name, description || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding application:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
