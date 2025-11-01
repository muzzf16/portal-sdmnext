const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Query to get table info for the notifications table
db.serialize(() => {
  // Get information about the notifikasi/notifications table
  console.log('Checking the structure of the notifications table...\n');
  
  db.each("PRAGMA table_info(notifikasi)", (err, row) => {
    if (err) {
      console.error('Error querying notifikasi table structure:', err.message);
    } else {
      console.log(`Column: ${row.name}, Type: ${row.type}, Not Null: ${row.notnull}, Default: ${row.dflt_value}, Primary Key: ${row.pk}`);
    }
  });

  // Also check for a notifications table (alternative name)
  console.log('\nChecking the structure of the notifications table (alternative name)...\n');
  db.each("PRAGMA table_info(notifications)", (err, row) => {
    if (err) {
      console.log('No notifications table found (this is expected if table is named "notifikasi")');
    } else {
      console.log(`Column: ${row.name}, Type: ${row.type}, Not Null: ${row.notnull}, Default: ${row.dflt_value}, Primary Key: ${row.pk}`);
    }
  });

  // Query to list all tables
  console.log('\nListing all tables in the database...\n');
  db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
    if (err) {
      console.error('Error querying table list:', err.message);
    } else {
      console.log(`Table: ${row.name}`);
    }
  });
});

db.close();