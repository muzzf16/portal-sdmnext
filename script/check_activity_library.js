const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = process.env.DATABASE_PATH || '/data/database.sqlite';

const db = new sqlite3.Database(dbPath);

console.log(`Checking activity_library table at ${dbPath}...`);

db.serialize(() => {
  db.all("PRAGMA table_info(activity_library)", (err, rows) => {
    if (err) {
      console.error('Error querying activity_library table structure:', err.message);
      process.exit(1);
    } else {
      console.log('Columns in activity_library:');
      let found = false;
      rows.forEach(row => {
        console.log(`- ${row.name} (${row.type})`);
        if (row.name === 'default_nominal') {
          found = true;
        }
      });
      
      if (found) {
        console.log('\n✅ default_nominal column exists.');
      } else {
        console.log('\n❌ default_nominal column NOT found.');
      }
    }
    db.close();
  });
});
