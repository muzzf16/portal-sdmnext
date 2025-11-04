const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkLogo() {
  try {
    const db = await open({
      filename: './apps/backend/database.sqlite',
      driver: sqlite3.Database
    });
    const result = await db.get('SELECT logo FROM company_settings LIMIT 1');
    console.log('Logo path from DB:', result);
  } catch (error) {
    console.error('Error checking logo:', error);
  }
}

checkLogo();
