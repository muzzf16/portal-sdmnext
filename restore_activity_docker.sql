PRAGMA foreign_keys=OFF;
ATTACH DATABASE '/tmp/db_backup.sqlite' AS backup;
BEGIN TRANSACTION;

INSERT OR IGNORE INTO activity_library
SELECT * FROM backup.activity_library;

COMMIT;
DETACH DATABASE backup;
PRAGMA foreign_keys=ON;
