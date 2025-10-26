
-- =============================
-- TABLE: notifications
-- =============================
CREATE TABLE IF NOT EXISTS notifikasi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- e.g., info, warning, error, success
    is_read BOOLEAN DEFAULT 0,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES pegawai(id)
);
