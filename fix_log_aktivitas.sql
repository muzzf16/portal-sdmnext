PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

CREATE TABLE log_aktivitas_harian_new (
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
    FOREIGN KEY (id_activity_library) REFERENCES activity_library(id) ON DELETE CASCADE
);

INSERT INTO log_aktivitas_harian_new SELECT * FROM log_aktivitas_harian;

DROP TABLE log_aktivitas_harian;

ALTER TABLE log_aktivitas_harian_new RENAME TO log_aktivitas_harian;

COMMIT;
PRAGMA foreign_keys=on;
