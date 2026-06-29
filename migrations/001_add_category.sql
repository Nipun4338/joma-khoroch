-- Adds a structured category to expenses so voice-captured transactions can be
-- charted by category. Additive and idempotent — safe to run on a live DB.
-- Existing rows get NULL (treated as "other" by the app).
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category VARCHAR(40);

-- Speeds up spend-by-category aggregation.
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
