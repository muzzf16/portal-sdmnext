const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

(async () => {
    try {
        const dbPath = path.resolve(__dirname, '../../database.sqlite');
        const db = await open({ filename: dbPath, driver: sqlite3.Database });

        console.log('Creating laporan_kepatuhan table if not exists...');
        await db.run(`
            CREATE TABLE IF NOT EXISTS laporan_kepatuhan (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nama_laporan TEXT NOT NULL,
                ketentuan TEXT,
                periode TEXT,
                tata_cara TEXT,
                batas_akhir DATE NOT NULL,
                bagian TEXT,
                employee_id TEXT,
                status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
                keterangan TEXT,
                tanggal_diselesaikan DATETIME,
                lampiran TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES pegawai(id) ON DELETE SET NULL
            )
        `);
        console.log('Table laporan_kepatuhan created successfully.');

        await db.close();
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
})();
