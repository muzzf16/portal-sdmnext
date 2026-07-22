const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({
    filename: '/opt/portal-sdmv3/database.sqlite',
    driver: sqlite3.Database
  });

  try {
    const res = await db.all(`
            SELECT l.*, p.name as employee_name
            FROM laporan_kepatuhan l
            LEFT JOIN pegawai p ON l.employee_id = p.id
            WHERE l.employee_id = ?
        `, 'emp-1760677257306');
    console.log(res);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
