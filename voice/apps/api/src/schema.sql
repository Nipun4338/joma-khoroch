-- Voice MVP schema. Self-contained; lives in its own database
-- (joma_khoroch_voice), separate from the existing web app's tables.

CREATE EXTENSION IF NOT EXISTS pgcrypto;       -- gen_random_uuid()

-- To tag transactions with location later, enable PostGIS and add a
-- `geom geography(Point,4326)` column. Nothing in the MVP needs it, so it's
-- left out to keep the install light.
-- CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount          NUMERIC(12, 2) NOT NULL,
  direction       TEXT NOT NULL CHECK (direction IN ('expense', 'income')),
  category        TEXT NOT NULL,
  counterparty    TEXT,
  payment_method  TEXT,
  note            TEXT NOT NULL DEFAULT '',
  raw_transcript  TEXT NOT NULL,
  confidence      REAL NOT NULL DEFAULT 0,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Common query: recent transactions, and spend grouped by category over a range.
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);
