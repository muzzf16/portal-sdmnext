
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function fixLogAktivitasFK() {
  const db = await open({
    filename: '/data/database.sqlite',
    driver: sqlite3.Database
  });

  console.log('Starting migration to fix foreign keys in log_aktivitas_harian...');

  // 1. Turn off foreign keys for the migration
  await db.exec('PRAGMA foreign_keys = OFF;');

  try {
    await db.exec('BEGIN TRANSACTION;');

    // 2. Rename old table
    console.log('Renaming old table...');
    await db.exec('ALTER TABLE log_aktivitas_harian RENAME TO log_aktivitas_harian_old;');

    // 3. Create new table with correct foreign keys
    console.log('Creating new table with correct foreign keys...');
    await db.exec(`
      CREATE TABLE log_aktivitas_harian (
          id_log INTEGER PRIMARY KEY AUTOINCREMENT,
          id_pegawai TEXT NOT NULL,
          tanggal DATE NOT NULL,
          id_activity_library TEXT NOT NULL,
          frekuensi INTEGER NOT NULL DEFAULT 1,
          total_durasi_terhitung INTEGER NOT NULL DEFAULT 0,
          status_approval TEXT CHECK(status_approval IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
          catatan TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          lampiran TEXT,
          nominal_rupiah REAL DEFAULT 0,
          FOREIGN KEY (id_pegawai) REFERENCES pegawai(id) ON DELETE CASCADE,
          FOREIGN KEY (id_activity_library) REFERENCES activity_library(id) ON DELETE CASCADE
      );
    `);

    // 4. Copy data
    console.log('Copying data...');
    await db.exec(`
      INSERT INTO log_aktivitas_harian (
        id_log, id_pegawai, tanggal, id_activity_library, frekuensi, 
        total_durasi_terhitung, status_approval, catatan, created_at, 
        updated_at, lampiran, nominal_rupiah
      )
      SELECT 
        id_log, id_pegawai, tanggal, id_activity_library, frekuensi, 
        total_durasi_terhitung, status_approval, catatan, created_at, 
        updated_at, lampiran, nominal_rupiah
      FROM log_aktivitas_harian_old;
    `);

    // 5. Drop old table
    console.log('Dropping old table...');
    await db.exec('DROP TABLE log_aktivitas_harian_old;');

    await db.exec('COMMIT;');
    console.log('Migration completed successfully!');
  } catch (error) {
    await db.exec('ROLLBACK;');
    console.log('Migration failed, rolled back changes.');
    console.error(error);
  } finally {
    await db.exec('PRAGMA foreign_keys = ON;');
    await db.close();
  }
}

fixLogAktivitasFK();
