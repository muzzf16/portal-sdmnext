-- Migration: 20260612_add_arsip_dokumen
-- Tabel untuk pengarsipan dokumen perusahaan (SK Direksi, Notulen Rapat, NIB, SOP, dll)

CREATE TABLE IF NOT EXISTS arsip_dokumen (
  id TEXT PRIMARY KEY,
  judul TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN (
    'SK_DIREKSI', 'NOTULEN_RAPAT', 'NIB', 'SOP',
    'PERATURAN', 'PERJANJIAN', 'LEGALITAS', 'LAINNYA'
  )),
  nomorDokumen TEXT,
  tanggalTerbit TEXT,
  tanggalBerlaku TEXT,
  tanggalKadaluarsa TEXT,
  penerbit TEXT,
  deskripsi TEXT,
  filePath TEXT,
  ukuranFile INTEGER,
  tipeFile TEXT,
  tags TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'kadaluarsa', 'dicabut')),
  uploadedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_kategori ON arsip_dokumen (kategori);
CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_status ON arsip_dokumen (status);
CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_tanggalKadaluarsa ON arsip_dokumen (tanggalKadaluarsa);
