-- =============================
-- TABLE: absensi (attendance)
-- =============================
CREATE TABLE IF NOT EXISTS absensi (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    date DATE NOT NULL,
    clockIn TIME,
    clockOut TIME,
    status TEXT DEFAULT 'hadir' CHECK(status IN ('hadir','izin','sakit','cuti','alpa')), -- hadir, izin, sakit, cuti, alpa
    workDuration TEXT, -- e.g., "8j 34m"
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id)
);