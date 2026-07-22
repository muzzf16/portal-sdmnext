const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/data/database.sqlite');
db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('absensi', 'absensi_old')", (err, rows) => {
    console.log("TABLES:", rows);
    if (rows.find(r => r.name === 'absensi_old')) {
      if (rows.find(r => r.name === 'absensi')) {
        db.run("DROP TABLE absensi");
      }
    } else if (rows.find(r => r.name === 'absensi')) {
      db.run("ALTER TABLE absensi RENAME TO absensi_old");
    }
  });
});
