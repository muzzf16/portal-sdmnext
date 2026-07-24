-- Migration: Add surat_penawaran column to pelatihan table
ALTER TABLE pelatihan ADD COLUMN surat_penawaran TEXT;
