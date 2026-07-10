PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

CREATE TABLE daily_activities_new (
    id_daily_activity INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai TEXT NOT NULL,
    id_kpi_target INTEGER,
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
    FOREIGN KEY (id_kpi_target) REFERENCES kpi_targets(id_kpi_target) ON DELETE SET NULL
);

INSERT INTO daily_activities_new SELECT * FROM daily_activities;

DROP TABLE daily_activities;

ALTER TABLE daily_activities_new RENAME TO daily_activities;

COMMIT;
PRAGMA foreign_keys=on;
