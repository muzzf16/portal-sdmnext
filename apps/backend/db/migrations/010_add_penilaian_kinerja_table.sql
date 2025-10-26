-- =============================
-- TABLE: penilaian_kinerja (performance reviews)
-- =============================
CREATE TABLE IF NOT EXISTS penilaian_kinerja (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    period TEXT NOT NULL, -- e.g., "Q2 2024"
    reviewerName TEXT NOT NULL,
    reviewDate DATE NOT NULL,
    overallScore REAL NOT NULL,
    status TEXT DEFAULT 'Draft',
    strengths TEXT,
    areasForImprovement TEXT,
    employeeFeedback TEXT,
    kpis TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id)
);