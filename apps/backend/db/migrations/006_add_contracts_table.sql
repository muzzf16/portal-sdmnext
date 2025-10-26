-- =============================
-- TABLE: contracts
-- =============================
CREATE TABLE IF NOT EXISTS kontrak (
    id TEXT PRIMARY KEY,
    employeeId TEXT,
    contractNumber TEXT UNIQUE,
    contractType TEXT CHECK(contractType IN ('permanent', 'temporary', 'contract')), -- permanent, temporary, contract
    startDate TEXT,
    endDate TEXT,
    status TEXT CHECK(status IN ('active', 'expiring', 'expired', 'terminated')), -- active, expiring, expired, terminated
    contractFile TEXT,
    terms TEXT,
    salary REAL,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employeeId) REFERENCES pegawai(id)
);