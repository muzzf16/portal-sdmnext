-- Fix daily_activities foreign key mismatch
-- The table references pegawai(id_pegawai) and kpi_targets(id_kpi_target)
-- but the actual PKs are pegawai(id) and kpi_targets(id)
-- Since the table has 0 rows, we can safely drop and recreate.

PRAGMA foreign_keys=OFF;

DROP TABLE IF EXISTS daily_activities;

CREATE TABLE daily_activities (
    id_daily_activity INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai TEXT NOT NULL,
    id_kpi_target TEXT,
    activityName TEXT NOT NULL,
    tanggal DATE NOT NULL,
    jam_mulai TIME,
    jam_selesai TIME,
    durasiMenit INTEGER,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    evidenceUrl TEXT,
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id) ON DELETE CASCADE,
    FOREIGN KEY (id_kpi_target) REFERENCES kpi_targets(id) ON DELETE SET NULL
);

PRAGMA foreign_keys=ON;
