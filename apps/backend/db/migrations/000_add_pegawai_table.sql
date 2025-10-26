-- =============================
-- TABLE: pegawai
-- =============================
CREATE TABLE IF NOT EXISTS pegawai (
    id TEXT PRIMARY KEY,
    nip TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    position TEXT,
    pangkat TEXT,
    golongan TEXT,
    department TEXT,
    joinDate DATE,
    avatarUrl TEXT,
    leaveBalance INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1 CHECK(isActive IN (0, 1)), -- 1 for active, 0 for inactive
    address TEXT,
    phone TEXT,
    pob TEXT, -- place of birth
    dob DATE, -- date of birth
    religion TEXT CHECK(religion IN ('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu')),
    maritalStatus TEXT CHECK(maritalStatus IN ('Lajang', 'Menikah', 'Duda', 'Janda')),
    numberOfChildren INTEGER DEFAULT 0,
    educationHistory TEXT, -- JSON
    workHistory TEXT, -- JSON
    trainingCertificates TEXT, -- JSON
    payrollInfo TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);