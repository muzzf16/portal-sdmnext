const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Applying migration to add terlambat status to absensi table...');

// First, rename the existing table
db.serialize(() => {
  db.run("ALTER TABLE absensi RENAME TO absensi_old;", (err) => {
    if (err) {
      console.error('Error renaming table:', err.message);
      db.close();
      return;
    }
    
    console.log('Table renamed successfully');
    
    // Create new table with updated constraint
    db.run(`
      CREATE TABLE absensi (
        id TEXT PRIMARY KEY,
        employeeId TEXT,
        employeeName TEXT,
        date TEXT,
        clockIn TEXT,
        clockOut TEXT,
        status TEXT DEFAULT 'hadir' CHECK(status IN ('hadir','izin','sakit','cuti','alpa','terlambat', 'tidak masuk')),
        workDuration TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(employeeId) REFERENCES pegawai(id)
      );
    `, (err2) => {
      if (err2) {
        console.error('Error creating new table:', err2.message);
        db.close();
        return;
      }
      
      console.log('New table created successfully');
      
      // Copy data from old table to new table
      db.run("INSERT INTO absensi SELECT * FROM absensi_old;", (err3) => {
        if (err3) {
          console.error('Error copying data:', err3.message);
          db.close();
          return;
        }
        
        console.log('Data copied successfully');
        
        // Drop old table
        db.run("DROP TABLE absensi_old;", (err4) => {
          if (err4) {
            console.error('Error dropping old table:', err4.message);
            db.close();
            return;
          }
          
          console.log('Migration completed successfully!');
          db.close();
        });
      });
    });
  });
});