-- ====================================================
-- KPI Feature Migration: Activity Library + KPI Targets
-- ====================================================

-- 📚 PERPUSTAKAAN AKTIVITAS (Activity Library)
-- Master data durasi standar per jabatan
CREATE TABLE IF NOT EXISTS activity_library (
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    period TEXT NOT NULL,            -- Periode (YYYY-S1, YYYY-S2, YYYY)
    kpiName TEXT NOT NULL,           -- Nama KPI
    targetValue REAL NOT NULL DEFAULT 0,  -- Nilai target
    targetUnit TEXT,                 -- Satuan (%, hari, jumlah, menit)
    weight INTEGER NOT NULL DEFAULT 0,    -- Bobot (%)
    actualValue REAL DEFAULT 0,     -- Realisasi
    score REAL DEFAULT 0,           -- Skor otomatis (1-5)
    status TEXT CHECK(status IN ('active','completed','cancelled')) DEFAULT 'active',
    source TEXT CHECK(source IN ('abk','manual')) DEFAULT 'manual',
    abkActivityId TEXT,             -- Link ke activity_library (opsional)
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 📊 SEED DATA: Perpustakaan Aktivitas Default
-- Data berdasarkan FITUR_KPI.md

-- CS (Customer Service)
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-cs-001', 'CS', 'Operasional', 'Pembukaan rekening', 10, 'Nasabah', 'operasional'),
('act-cs-002', 'CS', 'Operasional', 'Konsultasi nasabah', 20, 'Nasabah', 'operasional'),
('act-cs-003', 'CS', 'Operasional', 'Handling komplain', 15, 'Kasus', 'operasional'),
('act-cs-004', 'CS', 'Operasional', 'Input data nasabah', 5, 'Dokumen', 'administrasi');

-- Teller
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-tl-001', 'Teller', 'Operasional', 'Setoran / tarikan tunai', 5, 'Transaksi', 'operasional'),
('act-tl-002', 'Teller', 'Operasional', 'Cash opname', 15, 'Laporan', 'operasional'),
('act-tl-003', 'Teller', 'Operasional', 'Transfer antar bank', 3, 'Transaksi', 'operasional'),
('act-tl-004', 'Teller', 'Operasional', 'Verifikasi dokumen', 5, 'Dokumen', 'administrasi');

-- Collection
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-cl-001', 'Collection', 'Bisnis', 'Penagihan lapangan', 30, 'Nasabah', 'lapangan'),
('act-cl-002', 'Collection', 'Bisnis', 'Perjalanan ke nasabah', 45, 'Kunjungan', 'lapangan'),
('act-cl-003', 'Collection', 'Bisnis', 'Input laporan penagihan', 10, 'Laporan', 'administrasi'),
('act-cl-004', 'Collection', 'Bisnis', 'Follow up via telepon', 10, 'Panggilan', 'operasional');

-- HRD
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-hr-001', 'HRD', 'Support', 'Screening CV', 150, 'Berkas', 'administrasi'),
('act-hr-002', 'HRD', 'Support', 'Proses payroll', 150, 'Batch', 'administrasi'),
('act-hr-003', 'HRD', 'Support', 'Interview kandidat', 60, 'Kandidat', 'operasional'),
('act-hr-004', 'HRD', 'Support', 'Administrasi kepegawaian', 30, 'Dokumen', 'administrasi');

-- IT
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-it-001', 'IT', 'Support', 'Troubleshooting sistem', 120, 'Tiket', 'operasional'),
('act-it-002', 'IT', 'Support', 'Maintenance rutin', 15, 'Server', 'operasional'),
('act-it-003', 'IT', 'Support', 'Kunjungan cabang untuk trouble', 300, 'Kunjungan', 'lapangan'),
('act-it-004', 'IT', 'Support', 'Update dan patch sistem', 60, 'Sistem', 'operasional');

-- Analis Kredit
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-ak-001', 'Analis Kredit', 'Bisnis', 'Analisa kredit', 80, 'Berkas', 'operasional'),
('act-ak-002', 'Analis Kredit', 'Bisnis', 'Survei lapangan', 120, 'Nasabah', 'lapangan'),
('act-ak-003', 'Analis Kredit', 'Bisnis', 'Input data kredit', 15, 'Dokumen', 'administrasi'),
('act-ak-004', 'Analis Kredit', 'Bisnis', 'Verifikasi jaminan', 30, 'Dokumen', 'operasional');

-- Accounting
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-ac-001', 'Accounting', 'Operasional', 'Jurnal harian', 10, 'Jurnal', 'operasional'),
('act-ac-002', 'Accounting', 'Operasional', 'Closing bulanan', 7200, 'Laporan', 'operasional'),
('act-ac-003', 'Accounting', 'Operasional', 'Rekonsiliasi', 30, 'Akun', 'operasional'),
('act-ac-004', 'Accounting', 'Operasional', 'Laporan keuangan', 120, 'Laporan', 'administrasi');

-- Treasury
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-tr-001', 'Treasury', 'Operasional', 'Proses invoice', 5, 'Invoice', 'operasional'),
('act-tr-002', 'Treasury', 'Operasional', 'Rekonsiliasi bank', 60, 'Akun', 'operasional'),
('act-tr-003', 'Treasury', 'Operasional', 'Pembayaran vendor', 10, 'Transaksi', 'operasional'),
('act-tr-004', 'Treasury', 'Operasional', 'Laporan arus kas', 45, 'Laporan', 'administrasi');

-- Admin Kredit/Lelang
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-al-001', 'Admin Lelang', 'Support', 'Input berkas lelang web', 120, 'Berkas', 'administrasi'),
('act-al-002', 'Admin Lelang', 'Support', 'Koordinasi BPN', 60, 'Dokumen', 'administrasi'),
('act-al-003', 'Admin Lelang', 'Support', 'Scan dan arsip berkas', 30, 'Berkas', 'administrasi');

-- Funding
INSERT OR IGNORE INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category) VALUES
('act-fd-001', 'Funding', 'Bisnis', 'Kunjungan nasabah potensial', 60, 'Nasabah', 'lapangan'),
('act-fd-002', 'Funding', 'Bisnis', 'Perjalanan ke nasabah', 45, 'Kunjungan', 'lapangan'),
('act-fd-003', 'Funding', 'Bisnis', 'Presentasi produk', 30, 'Presentasi', 'operasional'),
('act-fd-004', 'Funding', 'Bisnis', 'Follow up deposito/tabungan', 15, 'Nasabah', 'operasional');
