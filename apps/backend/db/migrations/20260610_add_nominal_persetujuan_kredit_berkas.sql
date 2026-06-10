-- ====================================================
-- Migration: Add nominal_persetujuan to kredit_berkas
-- ====================================================

ALTER TABLE kredit_berkas ADD COLUMN nominal_persetujuan REAL;
