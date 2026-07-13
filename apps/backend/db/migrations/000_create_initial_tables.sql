PRAGMA foreign_keys = ON;

-- 1. Tabel Pegawai
CREATE TABLE IF NOT EXISTS pegawai (
    id TEXT PRIMARY KEY,
    name TEXT,
    nip TEXT UNIQUE,
    position TEXT,
    pangkat TEXT,
    golongan TEXT,
    department TEXT,
    joinDate TEXT,
    avatarUrl TEXT,
    jenis_kelamin TEXT,
    leaveBalance INTEGER,
    isActive INTEGER,
    address TEXT,
    phone TEXT,
    pob TEXT,
    dob TEXT,
    religion TEXT,
    maritalStatus TEXT,
    numberOfChildren INTEGER,
    educationHistory TEXT,
    workHistory TEXT,
    trainingCertificates TEXT,
    payrollInfo TEXT,
    email TEXT,
    statusKaryawan TEXT DEFAULT 'aktif',
    tanggalKeluar TEXT,
    tanggalCalonPegawai TEXT,
    tanggalKenaikanPangkatTerakhir TEXT,
    tanggalKenaikanPangkatSelanjutnya TEXT,
    tanggalKenaikanGajiBerkala TEXT,
    createdAt DATETIME
);

-- 2. Tabel Pengguna
CREATE TABLE IF NOT EXISTS pengguna (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT, -- 'admin' atau 'employee'
    employeeId TEXT,
    avatarUrl TEXT,
    createdAt DATETIME,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 3. Absensi
CREATE TABLE IF NOT EXISTS absensi (
    id TEXT PRIMARY KEY,
    employeeId TEXT,
    employeeName TEXT,
    date TEXT,
    clockIn TEXT,
    clockOut TEXT,
    status TEXT DEFAULT 'hadir' CHECK(status IN ('hadir','izin','sakit','cuti','alpa','terlambat', 'tidak masuk')),
    workDuration TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 4. permintaan cuti
CREATE TABLE IF NOT EXISTS permintaan_cuti (
    id TEXT PRIMARY KEY,
    employeeId TEXT,
    employeeName TEXT,
    leaveType TEXT,
    startDate TEXT,
    endDate TEXT,
    jumlahHari INTEGER NULL,
    reason TEXT,
    status TEXT DEFAULT 'menunggu',
    supportingDocument TEXT,
    rejectionReason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 5. penggajian
CREATE TABLE IF NOT EXISTS penggajian (
    id TEXT PRIMARY KEY,
    employeeId TEXT,
    employeeName TEXT,
    period TEXT,
    baseSalary REAL,
    incomes TEXT, -- JSON
    deductions TEXT, -- JSON
    totalIncome REAL,
    totalDeductions REAL,
    netSalary REAL,
    tanggalPembayaran TEXT,
    createdAt DATETIME,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 6. penilaian_kinerja
CREATE TABLE IF NOT EXISTS penilaian_kinerja (
    id TEXT PRIMARY KEY,
    employeeId TEXT,
    employeeName TEXT,
    period TEXT,
    reviewerName TEXT,
    reviewDate TEXT,
    overallScore REAL,
    status TEXT,
    strengths TEXT,
    areasForImprovement TEXT,
    employeeFeedback TEXT,
    kpis TEXT, -- JSON
    penilaiId TEXT,
    createdAt DATETIME,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 7. kontrak
CREATE TABLE IF NOT EXISTS kontrak (
    id TEXT PRIMARY KEY,
    employeeId TEXT,
    contractNumber TEXT,
    contractType TEXT,
    startDate TEXT,
    endDate TEXT,
    status TEXT,
    contractFile TEXT,
    terms TEXT,
    salary REAL,
    notes TEXT,
    createdAt DATETIME,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 8. pelatihan
CREATE TABLE IF NOT EXISTS pelatihan (
    id INTEGER PRIMARY KEY,
    pegawai_id TEXT,
    nama_pelatihan TEXT,
    penyelenggara TEXT,
    tanggal_mulai TEXT,
    tanggal_selesai TEXT,
    nomor_sertifikat TEXT,
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 9. riwayat_jabatan
CREATE TABLE IF NOT EXISTS riwayat_jabatan (
    id INTEGER PRIMARY KEY,
    pegawai_id TEXT,
    jabatan_lama TEXT,
    jabatan_baru TEXT,
    tanggal_perubahan TEXT,
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 10. tugas_orientasi
CREATE TABLE IF NOT EXISTS tugas_orientasi (
    id INTEGER PRIMARY KEY,
    employee_id TEXT,
    task_name TEXT,
    description TEXT,
    due_date TEXT,
    completed INTEGER,
    FOREIGN KEY (employee_id) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 11. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    message TEXT,
    type TEXT,
    is_read INTEGER,
    created_at DATETIME,
    scheduled_for DATETIME,
    delivery_channel TEXT,
    related_entity TEXT,
    related_entity_id TEXT,
    FOREIGN KEY (employee_id) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 12. pinjaman_karyawan
CREATE TABLE IF NOT EXISTS pinjaman_karyawan (
    id_pinjaman INTEGER PRIMARY KEY,
    id_pegawai INTEGER,
    tanggal_pinjaman DATE,
    jumlah REAL,
    tenor INTEGER,
    cicilan_perbulan REAL,
    sisa_pinjaman REAL,
    status_pinjaman TEXT,
    created_at DATETIME,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 13. users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT,
    password TEXT,
    role TEXT,
    employeeId TEXT,
    avatarUrl TEXT,
    created_at DATETIME,
    FOREIGN KEY (employeeId) REFERENCES pegawai(nip)
);