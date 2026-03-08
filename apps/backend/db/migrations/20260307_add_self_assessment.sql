-- Migration: Add self-assessment columns to penilaian_kinerja
-- Date: 2026-03-07
-- Purpose: Enable employees to submit self-assessments before supervisor review

ALTER TABLE penilaian_kinerja ADD COLUMN selfAssessmentScore REAL DEFAULT NULL;
ALTER TABLE penilaian_kinerja ADD COLUMN selfAssessmentKpis TEXT DEFAULT NULL;
ALTER TABLE penilaian_kinerja ADD COLUMN selfAssessmentStrengths TEXT DEFAULT NULL;
ALTER TABLE penilaian_kinerja ADD COLUMN selfAssessmentAreas TEXT DEFAULT NULL;
ALTER TABLE penilaian_kinerja ADD COLUMN selfAssessmentDate TEXT DEFAULT NULL;
ALTER TABLE penilaian_kinerja ADD COLUMN selfAssessmentStatus TEXT DEFAULT 'belum_diisi';
