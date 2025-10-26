-- =============================
-- TABLE: riwayat_jabatan
-- =============================
CREATE TABLE IF NOT EXISTS riwayat_jabatan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pegawai_id TEXT,
    jabatan_lama TEXT,
    jabatan_baru TEXT,
    tanggal_perubahan DATE,
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id)
);
