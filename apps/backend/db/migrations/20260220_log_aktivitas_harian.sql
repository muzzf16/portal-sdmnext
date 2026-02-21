-- ====================================================
-- KPI Feature Migration: Log Aktivitas Harian
-- ====================================================

-- 📝 LOG AKTIVITAS HARIAN (Daily Activity Log for WLA)
CREATE TABLE IF NOT EXISTS log_aktivitas_harian (
    id_log INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    id_activity_library INTEGER NOT NULL,
    frekuensi INTEGER NOT NULL DEFAULT 1,
    total_durasi_terhitung INTEGER NOT NULL DEFAULT 0,
    status_approval TEXT CHECK(status_approval IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE,
    FOREIGN KEY (id_activity_library) REFERENCES activity_library(id_activity_library) ON DELETE CASCADE
);
