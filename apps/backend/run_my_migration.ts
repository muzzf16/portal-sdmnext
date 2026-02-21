import { openDb } from './src/config/db';
import * as fs from 'fs';
import * as path from 'path';

(async () => {
    try {
        const db = await openDb();
        const migrationFile = path.join(__dirname, 'db', 'migrations', '20260220_log_aktivitas_harian.sql');
        const sql = await fs.promises.readFile(migrationFile, 'utf8');

        console.log('Running migration: 20260220_log_aktivitas_harian.sql');
        await db.exec(sql);
        console.log('Migration executed successfully.');
        process.exit(0);
    } catch (error: any) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
})();
