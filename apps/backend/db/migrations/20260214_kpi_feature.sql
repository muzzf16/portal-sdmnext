-- ====================================================
-- KPI Feature Migration: Activity Library + KPI Targets
-- ====================================================

-- 📚 PERPUSTAKAAN AKTIVITAS (Activity Library)
-- Master data durasi standar per jabatan
CREATE TABLE IF NOT EXISTS activity_library (
    id_activity_library INTEGER PRIMARY KEY AUTOINCREMENT,
    position TEXT NOT NULL,          -- Jabatan (CS, Teller, HRD, etc.)
    department TEXT,                 -- Departemen
    activityName TEXT NOT NULL,      -- Nama aktivitas
    durationMinutes INTEGER NOT NULL DEFAULT 0, -- Durasi standar (menit)
    outputUnit TEXT,                 -- Satuan output (dokumen, nasabah, transaksi)
    category TEXT,                   -- Kategori (operasional, administrasi, lapangan)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 🎯 TARGET KPI
-- Target KPI per pegawai per periode dengan auto-scoring
CREATE TABLE IF NOT EXISTS kpi_targets (
    id_kpi_target INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    period TEXT NOT NULL,            -- Periode (YYYY-S1, YYYY-S2, YYYY)
    kpiName TEXT NOT NULL,           -- Nama KPI
    metricType TEXT CHECK(metricType IN ('maximize', 'minimize')) DEFAULT 'maximize', -- Tipe metrik
    targetValue REAL NOT NULL DEFAULT 0,  -- Nilai target
    targetUnit TEXT,                 -- Satuan (%, hari, jumlah, menit)
    weight INTEGER NOT NULL DEFAULT 0,    -- Bobot (%)
    actualValue REAL DEFAULT 0,     -- Realisasi
    evidenceUrl TEXT,               -- Link bukti KPI (gdrive dsb)
    score REAL DEFAULT 0,           -- Skor otomatis (1-5)
    status TEXT CHECK(status IN ('draft', 'waiting_approval', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
    source TEXT CHECK(source IN ('abk','manual')) DEFAULT 'manual',
    abkActivityId INTEGER,             -- Link ke activity_library (opsional)
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE
);

-- 📝 AKTIVITAS HARIAN (Daily Activity Log)
-- Catatan aktivitas harian pegawai sebagai evidence realisasi
CREATE TABLE IF NOT EXISTS daily_activities (
    id_daily_activity INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    id_kpi_target INTEGER,           -- Link ke KPI Target (opsional)
    activityName TEXT NOT NULL,      -- Nama aktivitas
    tanggal DATE NOT NULL,
    jam_mulai TIME,
    jam_selesai TIME,
    durasiMenit INTEGER,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    evidenceUrl TEXT,                -- Bukti foto/dokumen/geotag
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE,
    FOREIGN KEY (id_kpi_target) REFERENCES kpi_targets(id_kpi_target) ON DELETE SET NULL
);

-- 📊 SEED DATA: Perpustakaan Aktivitas Default
-- Data berdasarkan FITUR_KPI.md

-- CS (Customer Service)
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('CS', 'Operasional', 'Pembukaan rekening', 10, 'Nasabah', 'operasional'),
('CS', 'Operasional', 'Konsultasi nasabah', 20, 'Nasabah', 'operasional'),
('CS', 'Operasional', 'Handling komplain', 15, 'Kasus', 'operasional'),
('CS', 'Operasional', 'Input data nasabah', 5, 'Dokumen', 'administrasi');

-- Teller
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('Teller', 'Operasional', 'Setoran / tarikan tunai', 5, 'Transaksi', 'operasional'),
('Teller', 'Operasional', 'Cash opname', 15, 'Laporan', 'operasional'),
('Teller', 'Operasional', 'Transfer antar bank', 3, 'Transaksi', 'operasional'),
('Teller', 'Operasional', 'Verifikasi dokumen', 5, 'Dokumen', 'administrasi');

-- Collection
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('Collection', 'Bisnis', 'Penagihan lapangan', 30, 'Nasabah', 'lapangan'),
('Collection', 'Bisnis', 'Perjalanan ke nasabah', 45, 'Kunjungan', 'lapangan'),
('Collection', 'Bisnis', 'Input laporan penagihan', 10, 'Laporan', 'administrasi'),
('Collection', 'Bisnis', 'Follow up via telepon', 10, 'Panggilan', 'operasional');

-- HRD
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('HRD', 'Support', 'Screening CV', 150, 'Berkas', 'administrasi'),
('HRD', 'Support', 'Proses payroll', 150, 'Batch', 'administrasi'),
('HRD', 'Support', 'Interview kandidat', 60, 'Kandidat', 'operasional'),
('HRD', 'Support', 'Administrasi kepegawaian', 30, 'Dokumen', 'administrasi');

-- IT
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('IT', 'Support', 'Troubleshooting sistem', 120, 'Tiket', 'operasional'),
('IT', 'Support', 'Maintenance rutin', 15, 'Server', 'operasional'),
('IT', 'Support', 'Kunjungan cabang untuk trouble', 300, 'Kunjungan', 'lapangan'),
('IT', 'Support', 'Update dan patch sistem', 60, 'Sistem', 'operasional');

-- Analis Kredit
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('Analis Kredit', 'Bisnis', 'Analisa kredit', 80, 'Berkas', 'operasional'),
('Analis Kredit', 'Bisnis', 'Survei lapangan', 120, 'Nasabah', 'lapangan'),
('Analis Kredit', 'Bisnis', 'Input data kredit', 15, 'Dokumen', 'administrasi'),
('Analis Kredit', 'Bisnis', 'Verifikasi jaminan', 30, 'Dokumen', 'operasional');

-- Accounting
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('Accounting', 'Operasional', 'Jurnal harian', 10, 'Jurnal', 'operasional'),
('Accounting', 'Operasional', 'Closing bulanan', 7200, 'Laporan', 'operasional'),
('Accounting', 'Operasional', 'Rekonsiliasi', 30, 'Akun', 'operasional'),
('Accounting', 'Operasional', 'Laporan keuangan', 120, 'Laporan', 'administrasi');

-- Treasury
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('Treasury', 'Operasional', 'Proses invoice', 5, 'Invoice', 'operasional'),
('Treasury', 'Operasional', 'Rekonsiliasi bank', 60, 'Akun', 'operasional'),
('Treasury', 'Operasional', 'Pembayaran vendor', 10, 'Transaksi', 'operasional'),
('Treasury', 'Operasional', 'Laporan arus kas', 45, 'Laporan', 'administrasi');

-- Admin Kredit/Lelang
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('Admin Lelang', 'Support', 'Input berkas lelang web', 120, 'Berkas', 'administrasi'),
('Admin Lelang', 'Support', 'Koordinasi BPN', 60, 'Dokumen', 'administrasi'),
('Admin Lelang', 'Support', 'Scan dan arsip berkas', 30, 'Berkas', 'administrasi');

-- Funding
INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) VALUES
('Funding', 'Bisnis', 'Kunjungan nasabah potensial', 60, 'Nasabah', 'lapangan'),
('Funding', 'Bisnis', 'Perjalanan ke nasabah', 45, 'Kunjungan', 'lapangan'),
('Funding', 'Bisnis', 'Presentasi produk', 30, 'Presentasi', 'operasional'),
('Funding', 'Bisnis', 'Follow up deposito/tabungan', 15, 'Nasabah', 'operasional');
