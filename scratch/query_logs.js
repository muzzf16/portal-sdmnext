const Database = require('better-sqlite3');
const dbLive = new Database('database.sqlite', { readonly: true });
const dbBackup = new Database('db_backup_2026-07-10T04-00-50.sqlite', { readonly: true });

console.log("--- LIVE DB ---");
const liveLogs = dbLive.prepare("SELECT COUNT(*) as count FROM log_aktivitas_harian WHERE tanggal LIKE '2026-07-10%'").get();
console.log(`Live DB Logs for 2026-07-10: ${liveLogs.count}`);

console.log("--- BACKUP DB ---");
try {
  const backupLogs = dbBackup.prepare("SELECT COUNT(*) as count FROM log_aktivitas_harian WHERE tanggal LIKE '2026-07-10%'").get();
  console.log(`Backup DB Logs for 2026-07-10: ${backupLogs.count}`);
} catch (e) {
  console.log("Error querying backup DB: " + e.message);
}

