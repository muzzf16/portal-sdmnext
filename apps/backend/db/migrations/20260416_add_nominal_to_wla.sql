-- Migration: Add nominal_rupiah to log_aktivitas_harian
ALTER TABLE log_aktivitas_harian ADD COLUMN nominal_rupiah REAL DEFAULT 0;
