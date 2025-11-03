PRAGMA foreign_keys = ON;

-- Create kandidat table for recruitment module
CREATE TABLE IF NOT EXISTS kandidat (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position_applied TEXT,
    status TEXT DEFAULT 'baru' CHECK(status IN ('baru', 'diproses', 'diterima', 'ditolak')),
    resume_url TEXT,
    applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update 'updated_at' column on UPDATE
CREATE TRIGGER IF NOT EXISTS update_kandidat_updated_at
    AFTER UPDATE ON kandidat
    FOR EACH ROW
BEGIN
    UPDATE kandidat SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;