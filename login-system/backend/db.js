/*
    Sets up and exports a PostgreSQL connection pool using the 'pg' library 

    - Reads the database connection string from environment variables 
    - Configures SSL for Supabase connections 
    - Provides a reusable pool for queries throughout the app 

    This file centralizes databae access so routes and other modules 
    can import the pool without creating new connections each time 
*/

// db.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
