const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = '/data/database.sqlite';
const db = new sqlite3.Database(dbPath);

const sql = `
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE log_aktivitas_harian_new (
    id_log INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
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
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE,
    FOREIGN KEY (id_activity_library) REFERENCES activity_library(id) ON DELETE CASCADE
);

INSERT INTO log_aktivitas_harian_new 
SELECT id_log, id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, status_approval, catatan, created_at, updated_at, lampiran, nominal_rupiah FROM log_aktivitas_harian;

DROP TABLE log_aktivitas_harian;
ALTER TABLE log_aktivitas_harian_new RENAME TO log_aktivitas_harian;

COMMIT;
PRAGMA foreign_keys=ON;
`;

db.exec(sql, (err) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log('Fix successful!');
    }
    db.close();
});
