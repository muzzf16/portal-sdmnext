const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Check if the column exists with the correct name
  console.log('Checking if tanggalKeluar column exists:\n');
  db.each("PRAGMA table_info(pegawai)", (err, row) => {
    if (err) {
      console.error('Error querying pegawai table structure:', err.message);
    } else {
      if (row.name === 'tanggalKeluar') {
        console.log(`✅ Found correct column: ${row.name} (${row.type})`);
      } else if (row.name === 'tanggal_keluar') {
        console.log(`❌ Found incorrect column (needs to be renamed): ${row.name} (${row.type})`);
      }
    }
  }, () => {
    // Close the database connection
    db.close(() => {
      console.log('Database connection closed.');
    });
  });
});