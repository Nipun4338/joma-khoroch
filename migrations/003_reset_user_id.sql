-- ⚠️ DESTRUCTIVE fresh start. Drops and rebuilds the three data tables keyed by
-- user_id (instead of email). Run this INSTEAD of migrations 001 and 002 — it
-- supersedes them. Existing transactions/balance/insights are wiped (approved:
-- data is disposable here). The `users` table and the dummy account are kept.
--
-- After this, the app provisions a users row per login (incl. Google) on sign-in
-- and scopes all data by users.user_id.

BEGIN;

-- OAuth users have no password — make it optional.
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS balance CASCADE;
DROP TABLE IF EXISTS insights CASCADE;

CREATE TABLE expenses (
    expense_id     SERIAL PRIMARY KEY,
    expense_title  VARCHAR(255) NOT NULL,
    expense_details TEXT,
    created_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status         BOOLEAN DEFAULT TRUE,
    expense        NUMERIC(10, 2) NOT NULL,
    expense_type   VARCHAR(10) CHECK (expense_type IN ('add', 'remove')),
    category       VARCHAR(40),
    user_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_expenses_user_id ON expenses (user_id);
CREATE INDEX idx_expenses_category ON expenses (category);

CREATE TABLE balance (
    id              SERIAL PRIMARY KEY,
    current_balance NUMERIC(15, 2) DEFAULT 0,
    user_id         INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE insights (
    id                     SERIAL PRIMARY KEY,
    daily_limit            NUMERIC(10, 2) DEFAULT 0,
    monthly_expense_target NUMERIC(10, 2) DEFAULT 0,
    user_id                INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

COMMIT;
