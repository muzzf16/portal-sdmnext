-- Migration: Add missing columns to kandidat table
-- Run: node apps/backend/db/migrations/run_kandidat_migration.js

ALTER TABLE kandidat ADD COLUMN cover_letter TEXT DEFAULT '';
ALTER TABLE kandidat ADD COLUMN application_date TEXT DEFAULT '';
ALTER TABLE kandidat ADD COLUMN notes TEXT DEFAULT '';
ALTER TABLE kandidat ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
