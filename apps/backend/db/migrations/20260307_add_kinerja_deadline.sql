-- Migration: Add deadline and improved status lifecycle to penilaian_kinerja
-- Date: 2026-03-07
-- Purpose: G1 (status lifecycle), G3 (deadline enforcement)

ALTER TABLE penilaian_kinerja ADD COLUMN selfAssessmentDeadline TEXT DEFAULT NULL;
