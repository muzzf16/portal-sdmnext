-- =============================
-- TABLE: permintaan_cuti (leave requests)
-- =============================
CREATE TABLE IF NOT EXISTS permintaan_cuti (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    leaveType TEXT NOT NULL CHECK(leaveType IN ('Cuti Tahunan','Cuti Sakit','Cuti Melahirkan','Izin','Alpa')),
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'menunggu' CHECK(status IN ('menunggu','disetujui','ditolak')), -- menunggu, disetujui, ditolak
    supportingDocument TEXT,
    rejectionReason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id)
);