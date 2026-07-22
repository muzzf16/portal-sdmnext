const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({
    filename: '/opt/portal-sdmv3/database.sqlite',
    driver: sqlite3.Database
  });

  const hash = await bcrypt.hash('password123', 10);
  await db.run("UPDATE pengguna SET password = ? WHERE email = 'ikasujiati@gmail.com'", hash);
  console.log("Password updated");
}
test();
