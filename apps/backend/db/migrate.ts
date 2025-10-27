// apps/backend/db/migrate.ts
import { openDb } from '../src/config/db';
import fs from 'fs';
import path from 'path';

export const runMigrations = async () => {
  const db = await openDb();
  const migrationsDir = path.join(__dirname, 'migrations');

  fs.readdir(migrationsDir, async (err, files) => {
    if (err) {
      return console.error("Could not list the directory.", err);
    }

    for (const file of files.sort()) {
      if (path.extname(file) === '.sql') {
        const migrationFile = path.join(migrationsDir, file);
        const sql = fs.readFileSync(migrationFile, 'utf8');
        try {
          await db.exec(sql);
          console.log(`Migration ${file} executed successfully.`);
        } catch (execErr: any) {
          console.error(`Error running migration ${file}:`, execErr.message);
        }
      }
    }
  });
};

export const initializeDb = async () => {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pengguna (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT CHECK(role IN ('admin','employee')) DEFAULT 'employee',
      employeeId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES pegawai(id)
    );
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
      jenis_kelamin TEXT CHECK(jenis_kelamin IN ('L', 'P')),
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
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS permintaan_cuti (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      employeeName TEXT,
      leaveType TEXT,
      startDate TEXT,
      endDate TEXT,
      jumlahHari INTEGER,
      reason TEXT,
      status TEXT CHECK(status IN ('menunggu','disetujui','ditolak')) DEFAULT 'menunggu',
      supportingDocument TEXT,
      rejectionReason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES pegawai(id)
    );
    CREATE TABLE IF NOT EXISTS penggajian (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      employeeName TEXT,
      period TEXT,
      baseSalary REAL,
      incomes TEXT,
      deductions TEXT,
      totalIncome REAL,
      totalDeductions REAL,
      netSalary REAL,
      tanggalPembayaran TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES pegawai(id)
    );
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
      kpis TEXT,
      penilaiId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES pegawai(id)
    );
    CREATE TABLE IF NOT EXISTS absensi (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      employeeName TEXT,
      date TEXT,
      clockIn TEXT,
      clockOut TEXT,
      status TEXT DEFAULT 'hadir' CHECK(status IN ('hadir','izin','sakit','cuti','alpa')),
      workDuration TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES pegawai(id)
    );
    CREATE TABLE IF NOT EXISTS permintaan_perubahan_data (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      employeeName TEXT,
      requestDate TEXT,
      message TEXT,
      status TEXT
    );
    CREATE TABLE IF NOT EXISTS kontrak (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      contractNumber TEXT UNIQUE,
      contractType TEXT,
      startDate TEXT,
      endDate TEXT,
      status TEXT,
      contractFile TEXT,
      terms TEXT,
      salary REAL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES pegawai(id)
    );
    CREATE TABLE IF NOT EXISTS riwayat_jabatan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pegawai_id TEXT,
      jabatan_lama TEXT,
      jabatan_baru TEXT,
      tanggal_perubahan TEXT,
      FOREIGN KEY(pegawai_id) REFERENCES pegawai(id)
    );
    CREATE TABLE IF NOT EXISTS pelatihan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pegawai_id TEXT,
      nama_pelatihan TEXT,
      penyelenggara TEXT,
      tanggal_mulai TEXT,
      tanggal_selesai TEXT,
      nomor_sertifikat TEXT,
      FOREIGN KEY(pegawai_id) REFERENCES pegawai(id)
    );
    CREATE TABLE IF NOT EXISTS kandidat (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      phone TEXT,
      position_applied TEXT,
      status TEXT,
      resume_url TEXT
    );
    CREATE TABLE IF NOT EXISTS tugas_orientasi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT,
      task_name TEXT,
      description TEXT,
      due_date TEXT,
      completed INTEGER,
      FOREIGN KEY(employee_id) REFERENCES pegawai(id)
    );
    CREATE TABLE IF NOT EXISTS notifikasi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT,
      message TEXT,
      type TEXT,
      is_read INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES pegawai(id)
    );
  `);
  console.log("Tables created or already exist.");
};

if (require.main === module) {
  (async () => {
    try {
      await initializeDb();
      await runMigrations();
      console.log('Database migration complete.');
    } catch (error) {
      console.error('Database migration failed:', error);
      process.exit(1);
    }
  })();
}
