-- Migration: Create password_history table
CREATE TABLE IF NOT EXISTS password_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
