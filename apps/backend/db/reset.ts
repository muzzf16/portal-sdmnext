
import { openDb } from '../src/config/db';

async function resetDatabase() {
  const db = await openDb();
  await db.exec('PRAGMA foreign_keys = OFF');
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  for (const table of tables) {
    await db.exec(`DROP TABLE IF EXISTS ${table.name}`);
  }
  await db.exec('PRAGMA foreign_keys = ON');
  console.log('Database reset successfully');
}

resetDatabase();
