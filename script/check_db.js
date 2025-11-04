const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkDb() {
  try {
    const db = await open({
      filename: 'apps/backend/database.sqlite',
      driver: sqlite3.Database
    });
    const row = await db.get("SELECT COUNT(*) as count FROM pegawai");
    console.log(row.count);
  } catch (err) {
    console.error(err.message);
  }
}

checkDb();