-- ====================================================
-- Migration: Monitoring Berkas Pengajuan Kredit
-- ====================================================

-- Master table for credit application files
CREATE TABLE IF NOT EXISTS kredit_berkas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomor_pengajuan TEXT NOT NULL,          -- Format: KRD-YYYYMMDD-001
    nama_pengajuan TEXT NOT NULL,           -- Nama debitur / nasabah
    jumlah_pengajuan REAL DEFAULT 0,        -- Nominal kredit
    jenis_kredit TEXT,                     -- Kredit Umum, KUR, Kredit Mikro, dsb
    current_stage TEXT NOT NULL DEFAULT 'penerimaan',  -- penerimaan | analisa | verifikasi | admin_pencairan | selesai
    overall_status TEXT NOT NULL DEFAULT 'dalam_proses', -- dalam_proses | lengkap | ditolak | dicairkan
    created_by TEXT NOT NULL,              -- employee_id (CS yang menerima)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    catatan TEXT,
    UNIQUE(nomor_pengajuan)
);

-- Tracking table for each stage progress
CREATE TABLE IF NOT EXISTS kredit_berkas_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    berkas_id INTEGER NOT NULL,            -- FK ke kredit_berkas.id
    stage TEXT NOT NULL,                   -- penerimaan | analisa | verifikasi | admin_pencairan
    employee_id TEXT NOT NULL,             -- Pegawai yang memproses
    employee_name TEXT,                    -- Nama pegawai
    position TEXT,                         -- Jabatan pegawai
    status_berkas TEXT NOT NULL DEFAULT 'belum_lengkap', -- lengkap | belum_lengkap | ditolak
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,         -- Kapan berkas sampai di stage ini
    completed_at DATETIME,                 -- Kapan selesai proses di stage ini
    catatan TEXT,                          -- Catatan dari pegawai pada stage ini
    FOREIGN KEY (berkas_id) REFERENCES kredit_berkas(id) ON DELETE CASCADE
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_kredit_berkas_stage ON kredit_berkas(current_stage);
CREATE INDEX IF NOT EXISTS idx_kredit_berkas_tracking_berkas_id ON kredit_berkas_tracking(berkas_id);
