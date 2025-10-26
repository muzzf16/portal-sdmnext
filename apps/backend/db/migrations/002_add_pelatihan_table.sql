
-- =============================
-- TABLE: pelatihan
-- =============================
CREATE TABLE IF NOT EXISTS pelatihan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pegawai_id TEXT,
    nama_pelatihan TEXT,
    penyelenggara TEXT,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    nomor_sertifikat TEXT,
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id)
);
