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
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    ca: process.env.SUPABASE_CA_CERT
  }
});

module.exports = pool;