-- Migration: Add surat_jalan column to pelatihan table
ALTER TABLE pelatihan ADD COLUMN surat_jalan TEXT;
