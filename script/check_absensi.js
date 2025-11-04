const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Checking the structure of the absensi table...\n');

db.each("PRAGMA table_info(absensi)", (err, row) => {
  if (err) {
    console.error('Error querying absensi table structure:', err.message);
  } else {
    console.log(`Column: ${row.name}, Type: ${row.type}, Not Null: ${row.notnull}, Default: ${row.dflt_value}, Primary Key: ${row.pk}`);
  }
}, () => {
  console.log('\nChecking for CHECK constraints in absensi table...\n');
  
  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='absensi'", (err, row) => {
    if (err) {
      console.error('Error getting table definition:', err.message);
    } else {
      console.log('Table definition:', row.sql);
    }
    db.close();
  });
});