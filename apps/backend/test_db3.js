const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({
    filename: '/opt/portal-sdmv3/database.sqlite',
    driver: sqlite3.Database
  });

  try {
    const status = undefined;
    const employee_id = 'emp-1760677257306';
    let query = `
            SELECT l.*, p.name as employee_name
            FROM laporan_kepatuhan l
            LEFT JOIN pegawai p ON l.employee_id = p.id
        `;
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push(`l.status = ?`);
            params.push(status);
        }

        if (employee_id) {
            conditions.push(`l.employee_id = ?`);
            params.push(employee_id);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY l.batas_akhir ASC`;

    const res = await db.all(query, ...params);
    console.log(res);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
