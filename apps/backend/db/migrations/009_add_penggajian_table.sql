-- =============================
-- TABLE: penggajian (payroll)
-- =============================
CREATE TABLE IF NOT EXISTS penggajian (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    period TEXT NOT NULL, -- e.g., "Juni 2024"
    baseSalary REAL NOT NULL,
    incomes TEXT, -- JSON array
    deductions TEXT, -- JSON array
    totalIncome REAL DEFAULT 0,
    totalDeductions REAL DEFAULT 0,
    netSalary REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id)
);