-- ====================================================
-- Fix WLA Foreign Key and Add Soft Delete to Activity Library
-- ====================================================

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- 1. Tambahkan kolom is_active ke activity_library
ALTER TABLE activity_library ADD COLUMN is_active INTEGER DEFAULT 1;

-- 2. Buat ulang tabel log_aktivitas_harian dengan ON DELETE RESTRICT
CREATE TABLE IF NOT EXISTS "log_aktivitas_harian_new" (
    id_log INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai TEXT NOT NULL,
    tanggal DATE NOT NULL,
    id_activity_library TEXT NOT NULL,
    frekuensi INTEGER NOT NULL DEFAULT 1,
    total_durasi_terhitung INTEGER NOT NULL DEFAULT 0,
    status_approval TEXT CHECK(status_approval IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    lampiran TEXT, 
    nominal_rupiah REAL DEFAULT 0,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id) ON DELETE CASCADE,
    FOREIGN KEY (id_activity_library) REFERENCES activity_library(id) ON DELETE RESTRICT
);

-- 3. Copy data lama ke tabel baru
INSERT INTO log_aktivitas_harian_new 
SELECT id_log, id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, 
       status_approval, catatan, created_at, updated_at, lampiran, nominal_rupiah 
FROM log_aktivitas_harian;

-- 4. Hapus tabel lama
DROP TABLE log_aktivitas_harian;

-- 5. Rename tabel baru menjadi lama
ALTER TABLE log_aktivitas_harian_new RENAME TO log_aktivitas_harian;

COMMIT;
PRAGMA foreign_keys=on;
