PRAGMA foreign_keys=OFF;

ALTER TABLE absensi RENAME TO absensi_old;

CREATE TABLE absensi (
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
  FOREIGN KEY(employeeId) REFERENCES pegawai(id)
);

INSERT INTO absensi SELECT * FROM absensi_old;
DROP TABLE absensi_old;

PRAGMA foreign_keys=ON;
