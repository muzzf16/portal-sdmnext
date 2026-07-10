PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
ATTACH DATABASE 'db_backup_2026-07-10T04-00-50.sqlite' AS backup;

DELETE FROM pegawai;
INSERT INTO pegawai SELECT * FROM backup.pegawai;

DELETE FROM log_aktivitas_harian;
INSERT INTO log_aktivitas_harian SELECT * FROM backup.log_aktivitas_harian;

DETACH DATABASE backup;
COMMIT;
PRAGMA foreign_keys=ON;
