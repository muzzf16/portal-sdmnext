CREATE TABLE IF NOT EXISTS laporan_kepatuhan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_laporan TEXT NOT NULL,
  ketentuan TEXT,
  periode TEXT,
  tata_cara TEXT,
  batas_akhir TEXT NOT NULL,
  bagian TEXT,
  employee_id TEXT REFERENCES pegawai(id),
  keterangan TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'selesai')),
  tanggal_diselesaikan TEXT,
  lampiran TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
