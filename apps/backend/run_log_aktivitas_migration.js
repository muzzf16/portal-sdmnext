const { openDb } = require('./src/config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        const db = await openDb();
        const migrationFile = path.join(__dirname, 'db', 'migrations', '20260220_log_aktivitas_harian.sql');
        const sql = await fs.promises.readFile(migrationFile, 'utf8');

        console.log('Running migration: 20260220_log_aktivitas_harian.sql');
        await db.exec(sql);
        console.log('Migration executed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
