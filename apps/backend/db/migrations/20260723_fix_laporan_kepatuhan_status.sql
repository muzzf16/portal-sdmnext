PRAGMA foreign_keys=off;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS laporan_kepatuhan_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_laporan TEXT NOT NULL,
  ketentuan TEXT,
  periode TEXT,
  tata_cara TEXT,
  batas_akhir TEXT NOT NULL,
  bagian TEXT,
  employee_id TEXT REFERENCES pegawai(id),
  keterangan TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'selesai')),
  tanggal_diselesaikan TEXT,
  lampiran TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO laporan_kepatuhan_new SELECT * FROM laporan_kepatuhan;
DROP TABLE laporan_kepatuhan;
ALTER TABLE laporan_kepatuhan_new RENAME TO laporan_kepatuhan;
COMMIT;
PRAGMA foreign_keys=on;
