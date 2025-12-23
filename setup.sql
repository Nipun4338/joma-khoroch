-- setup.sql
-- Run this script in your PostgreSQL database to create the necessary tables and initial data.

-- 1. Create Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- 2. Create Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    expense_id SERIAL PRIMARY KEY,
    expense_title VARCHAR(255) NOT NULL,
    expense_details TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN DEFAULT TRUE,
    expense NUMERIC(10, 2) NOT NULL,
    expense_type VARCHAR(10) CHECK (expense_type IN ('add', 'remove'))
);

-- 3. Create Balance table
CREATE TABLE IF NOT EXISTS balance (
    id SERIAL PRIMARY KEY,
    current_balance NUMERIC(15, 2) DEFAULT 0
);

-- 4. Create Insights table
CREATE TABLE IF NOT EXISTS insights (
    id SERIAL PRIMARY KEY,
    daily_limit NUMERIC(10, 2) DEFAULT 0,
    monthly_expense_target NUMERIC(10, 2) DEFAULT 0
);

-- 5. Insert Initial Data (Optional - Update with your own)
-- NOTE: Update the password with your desired password.
-- The login API uses bcrypt to securely verify passwords.
INSERT INTO users (email, password) VALUES ('user@example.com', '$2b$10$udhtJgowWKUcqT59TfahGufZaqD2ZHl0Rn2IOWkzJQxqfLoFw1TRC') ON CONFLICT DO NOTHING;

-- Initialize balance and insights if they are empty
INSERT INTO balance (current_balance) SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM balance);
INSERT INTO insights (daily_limit, monthly_expense_target) SELECT 1000, 30000 WHERE NOT EXISTS (SELECT 1 FROM insights);

-- 6. Sample indicator for expenses (Optional)
-- INSERT INTO expenses (expense_title, expense_details, expense, expense_type) VALUES ('Sample Income', 'Initial balance boost', 500.00, 'add');
