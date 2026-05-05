-- ====================================================
-- Migration: Add default_nominal to activity_library
-- Allows setting position-based nominal target defaults
-- ====================================================

-- Check if column exists first (SQLite doesn't support IF NOT EXISTS in ALTER TABLE)
-- We use a script or just let it fail gracefully if run via run_migrations.js
-- However, run_migrations.js usually runs raw SQL.

-- Safer way in SQLite:
-- Try to add the column. It will fail if it exists, which is fine if handled.
ALTER TABLE activity_library ADD COLUMN default_nominal REAL DEFAULT 0;
