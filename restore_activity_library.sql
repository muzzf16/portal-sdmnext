PRAGMA foreign_keys=OFF;
ATTACH DATABASE 'db_backup_2026-07-10T04-00-50.sqlite' AS backup;
BEGIN TRANSACTION;

INSERT OR IGNORE INTO activity_library
SELECT * FROM backup.activity_library;

COMMIT;
DETACH DATABASE backup;
PRAGMA foreign_keys=ON;
