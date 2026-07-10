PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
ATTACH DATABASE 'db_backup_2026-07-10T04-00-50.sqlite' AS backup;

DELETE FROM kredit_berkas;
INSERT INTO kredit_berkas SELECT * FROM backup.kredit_berkas;

DELETE FROM kredit_berkas_tracking;
INSERT INTO kredit_berkas_tracking SELECT * FROM backup.kredit_berkas_tracking;

DETACH DATABASE backup;
COMMIT;
PRAGMA foreign_keys=ON;
