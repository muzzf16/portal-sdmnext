const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function runMigration() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error('Please provide a migration file to run.');
    process.exit(1);
  }

  const filePath = path.join(__dirname, 'apps', 'backend', 'db', 'migrations', migrationFile);
  if (!fs.existsSync(filePath)) {
    console.error(`Migration file not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const db = await open({
      filename: './apps/backend/database.sqlite',
      driver: sqlite3.Database
    });

    const sql = fs.readFileSync(filePath, 'utf8');
    await db.exec(sql);

    console.log(`Successfully applied migration: ${migrationFile}`);
  } catch (error) {
    console.error(`Failed to apply migration: ${migrationFile}`, error);
  }
}

runMigration();
