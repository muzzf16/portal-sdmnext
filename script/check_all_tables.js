const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // List all tables first
  console.log('All tables in the database:\n');
  const tables = [];
  
  db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
    if (err) {
      console.error('Error querying table list:', err.message);
    } else {
      console.log(`Table: ${row.name}`);
      tables.push(row.name);
    }
  }, () => {
    // After listing all tables, get details of the pegawai table specifically
    console.log('\n\nStructure of the pegawai table:\n');
    db.each("PRAGMA table_info(pegawai)", (err, row) => {
      if (err) {
        console.error('Error querying pegawai table structure:', err.message);
      } else {
        console.log(`Column: ${row.name}, Type: ${row.type}, Not Null: ${row.notnull}, Default: ${row.dflt_value}, Primary Key: ${row.pk}`);
      }
    }, () => {
      // Close the database after all operations
      db.close();
    });
  });
});