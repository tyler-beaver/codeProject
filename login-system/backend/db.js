/*
    This code creates a reusable, secure, efficient connection manager that lets your Node backend safely talk to your Supabase PostgresSQL database
*/

const { pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

module.exports = pool; 