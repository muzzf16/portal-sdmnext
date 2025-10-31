// apps/backend/db/migrate.ts
import { openDb } from '../src/config/db';
import fs from 'fs';
import path from 'path';

export const runMigrations = async () => {
  const db = await openDb();
  const migrationsDir = path.join(__dirname, 'migrations');

  try {
    const files = await fs.promises.readdir(migrationsDir);
    for (const file of files.sort()) {
      if (path.extname(file) === '.sql') {
        const migrationFile = path.join(migrationsDir, file);
        const sql = await fs.promises.readFile(migrationFile, 'utf8');
        try {
          await db.exec(sql);
          console.log(`Migration ${file} executed successfully.`);
        } catch (execErr: any) {
          console.error(`Error running migration ${file}:`, execErr.message);
          // bubble up so callers can decide to exit if desired
          throw execErr;
        }
      }
    }
  } catch (err: any) {
    console.error('Could not run migrations:', err.message || err);
    throw err;
  }
};

if (require.main === module) {
  (async () => {
    try {
      await runMigrations();
      console.log('Database migration complete.');
    } catch (error) {
      console.error('Database migration failed:', error);
      process.exit(1);
    }
  })();
}
