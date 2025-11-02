const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function fixLogoPath() {
  try {
    const db = await open({
      filename: './apps/backend/database.sqlite',
      driver: sqlite3.Database
    });

    const currentSettings = await db.get('SELECT * FROM company_settings LIMIT 1');
    
    if (currentSettings && currentSettings.logo && currentSettings.logo.startsWith('http')) {
      console.log('Current (incorrect) logo path:', currentSettings.logo);
      const url = new URL(currentSettings.logo);
      const correctPath = url.pathname;
      
      await db.run('UPDATE company_settings SET logo = ? WHERE id = ?', [correctPath, currentSettings.id]);
      console.log('Successfully updated logo path to:', correctPath);
    } else {
      console.log('Logo path is already correct or not set. No changes needed.');
    }

  } catch (error) {
    console.error('Error fixing logo path:', error);
  }
}

fixLogoPath();
