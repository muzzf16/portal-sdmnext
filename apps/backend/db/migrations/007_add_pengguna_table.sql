-- =============================
-- TABLE: pengguna (users)
-- =============================
CREATE TABLE IF NOT EXISTS pengguna (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    employeeId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id)
);