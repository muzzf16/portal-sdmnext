PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
ATTACH DATABASE 'db_backup_2026-07-10T04-00-50.sqlite' AS backup;

DELETE FROM pegawai;
INSERT INTO pegawai (id, name, nip, position, pangkat, golongan, department, joinDate, avatarUrl, jenis_kelamin, leaveBalance, isActive, address, phone, pob, dob, religion, maritalStatus, numberOfChildren, educationHistory, workHistory, trainingCertificates, payrollInfo, email, statusKaryawan, tanggalKeluar, createdAt, jabatan_id, atasan_id)
SELECT id, name, nip, position, pangkat, golongan, department, joinDate, avatarUrl, jenis_kelamin, leaveBalance, isActive, address, phone, pob, dob, religion, maritalStatus, numberOfChildren, educationHistory, workHistory, trainingCertificates, payrollInfo, email, statusKaryawan, tanggalKeluar, createdAt, jabatan_id, atasan_id FROM backup.pegawai;

DETACH DATABASE backup;
COMMIT;
PRAGMA foreign_keys=ON;
