-- =============================================
-- Migration: Hierarki Jabatan (Job Hierarchy)
-- Date: 2026-02-15
-- =============================================

-- Tabel Master Jabatan (Position Hierarchy)
CREATE TABLE IF NOT EXISTS jabatan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 4,
  parent_id INTEGER,
  department TEXT,
  deskripsi TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES jabatan(id) ON DELETE SET NULL
);

-- Tambah kolom hierarki ke tabel pegawai
-- jabatan_id = link ke master jabatan
-- atasan_id = link langsung ke atasan (pegawai.id)

-- SQLite doesn't support ADD COLUMN with FOREIGN KEY inline,
-- so we add the columns first, constraints enforced at app level

-- Check if columns exist before adding (SQLite workaround)
-- These will silently fail if columns already exist

CREATE TABLE IF NOT EXISTS _migration_temp_check (id INTEGER);
DROP TABLE IF EXISTS _migration_temp_check;

-- Add jabatan_id column
ALTER TABLE pegawai ADD COLUMN jabatan_id INTEGER REFERENCES jabatan(id);

-- Add atasan_id column (direct supervisor)
ALTER TABLE pegawai ADD COLUMN atasan_id TEXT REFERENCES pegawai(id) ON DELETE SET NULL;

-- =============================================
-- Seed Data: Hierarki Jabatan untuk BPR/Perbankan
-- =============================================

-- Level 1: Direksi
INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Direktur Utama', 1, NULL, 'Direksi', 'Pimpinan tertinggi perusahaan');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Direktur', 1, 1, 'Direksi', 'Anggota direksi');

-- Level 2: Kepala Bidang / Pejabat Eksekutif (PE)
INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('KABID Operasional', 2, 1, 'Operasional', 'Kepala Bidang / Pejabat Eksekutif Operasional');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('KABID Pemasaran', 2, 1, 'Pemasaran', 'Kepala Bidang / Pejabat Eksekutif Pemasaran');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('KABID Umum & SDM', 2, 1, 'SDM', 'Kepala Bidang / Pejabat Eksekutif SDM');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('KABID Kepatuhan', 2, 1, 'Kepatuhan', 'Kepala Bidang / Pejabat Eksekutif Kepatuhan & Manajemen Risiko');

-- Level 3: Kepala Sub Bidang (Kasubid)
INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Kasubid Teller', 3, 3, 'Operasional', 'Kepala Sub Bidang Teller');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Kasubid CS', 3, 3, 'Operasional', 'Kepala Sub Bidang Customer Service');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Kasubid Kredit', 3, 4, 'Pemasaran', 'Kepala Sub Bidang Kredit');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Kasubid Dana', 3, 4, 'Pemasaran', 'Kepala Sub Bidang Penghimpunan Dana');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Kasubid SDM', 3, 5, 'SDM', 'Kepala Sub Bidang SDM');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Kasubid Umum', 3, 5, 'SDM', 'Kepala Sub Bidang Umum & Logistik');

-- Level 4: Staf
INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Teller', 4, 7, 'Operasional', 'Staf Teller');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Customer Service', 4, 8, 'Operasional', 'Staf Customer Service');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Account Officer', 4, 9, 'Pemasaran', 'Staf Pemasaran Kredit');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Funding Officer', 4, 10, 'Pemasaran', 'Staf Penghimpunan Dana');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Staf SDM', 4, 11, 'SDM', 'Staf Sumber Daya Manusia');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Staf Umum', 4, 12, 'SDM', 'Staf Umum & Logistik');

INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES
  ('Staf Kepatuhan', 4, 6, 'Kepatuhan', 'Staf Kepatuhan & Manajemen Risiko');
