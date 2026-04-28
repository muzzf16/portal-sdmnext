
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkPragmas() {
  const dbPath = process.env.DB_SOURCE || './database.sqlite';
  const resolvedPath = path.resolve(dbPath);
  console.log(`Checking DB at: ${resolvedPath}`);

  const db = await open({
    filename: resolvedPath,
    driver: sqlite3.Database
  });

  const fk = await db.get('PRAGMA foreign_keys;');
  const jm = await db.get('PRAGMA journal_mode;');

  console.log('--- Database Settings ---');
  console.log(`Foreign Keys: ${fk.foreign_keys === 1 ? 'ON' : 'OFF'}`);
  console.log(`Journal Mode: ${jm.journal_mode.toUpperCase()}`);
  console.log('-------------------------');

  await db.close();
}

checkPragmas().catch(console.error);
