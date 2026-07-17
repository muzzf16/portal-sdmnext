CREATE TABLE IF NOT EXISTS data_change_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    requestedChanges TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewedBy TEXT, -- Admin user ID
    reviewNotes TEXT,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);
