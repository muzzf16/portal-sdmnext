-- Add 'terlambat' to the allowed status values in absensi table CHECK constraint
-- This migration adds 'terlambat' and 'tidak masuk' to the status column constraint

-- First, rename the existing table
ALTER TABLE absensi RENAME TO absensi_old;

-- Create new table with updated constraint
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

-- Copy data from old table to new table
INSERT INTO absensi SELECT * FROM absensi_old;

-- Drop old table
DROP TABLE absensi_old;