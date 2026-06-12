-- Migration: 20260612_add_kerahasiaan_arsip_dokumen
-- Menambahkan tingkat kerahasiaan pada tabel arsip_dokumen

ALTER TABLE arsip_dokumen ADD COLUMN tingkatKerahasiaan TEXT NOT NULL DEFAULT 'PUBLIK'
  CHECK (tingkatKerahasiaan IN ('PUBLIK', 'INTERNAL', 'RAHASIA', 'SANGAT_RAHASIA'));

CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_kerahasiaan ON arsip_dokumen (tingkatKerahasiaan);
