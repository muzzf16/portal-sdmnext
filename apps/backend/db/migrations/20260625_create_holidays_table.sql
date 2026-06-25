CREATE TABLE IF NOT EXISTS holidays (
    id TEXT PRIMARY KEY,
    tanggal TEXT NOT NULL UNIQUE,
    deskripsi TEXT NOT NULL
);

-- Seed data awal dari cuti.service.ts
INSERT OR IGNORE INTO holidays (id, tanggal, deskripsi) VALUES
('1', '2026-01-01', 'Tahun Baru 2026'),
('2', '2026-03-31', 'Hari Raya Idul Fitri'),
('3', '2026-04-01', 'Cuti Bersama Idul Fitri'),
('4', '2026-05-01', 'Hari Buruh Internasional'),
('5', '2026-08-17', 'Hari Kemerdekaan RI'),
('6', '2026-12-25', 'Hari Natal'),
('7', '2026-12-26', 'Cuti Bersama Natal');
