-- setup.sql
-- Run this script in your PostgreSQL database to create the necessary tables and initial data.
-- All transaction data is scoped per user via user_id (see migrations/003 for the
-- migration path on an existing DB).

-- 1. Create Users table. password is nullable: Google (OAuth) users have none;
--    they're provisioned automatically on first sign-in.
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT
);

-- 2. Create Expenses table (owned by a user)
CREATE TABLE IF NOT EXISTS expenses (
    expense_id SERIAL PRIMARY KEY,
    expense_title VARCHAR(255) NOT NULL,
    expense_details TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN DEFAULT TRUE,
    expense NUMERIC(10, 2) NOT NULL,
    expense_type VARCHAR(10) CHECK (expense_type IN ('add', 'remove')),
    category VARCHAR(40),
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);

-- 3. Create Balance table (one row per user)
CREATE TABLE IF NOT EXISTS balance (
    id SERIAL PRIMARY KEY,
    current_balance NUMERIC(15, 2) DEFAULT 0,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Create Insights table (one row per user)
CREATE TABLE IF NOT EXISTS insights (
    id SERIAL PRIMARY KEY,
    daily_limit NUMERIC(10, 2) DEFAULT 0,
    monthly_expense_target NUMERIC(10, 2) DEFAULT 0,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Seed the dummy demo account (password: password123, bcrypt-hashed).
--    Per-user balance/insights rows are created automatically on first use.
INSERT INTO users (email, password) VALUES ('user@example.com', '$2b$10$udhtJgowWKUcqT59TfahGufZaqD2ZHl0Rn2IOWkzJQxqfLoFw1TRC') ON CONFLICT DO NOTHING;
