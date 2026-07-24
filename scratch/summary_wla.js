const sqlite3 = require('/opt/portal-sdmv3/apps/backend/node_modules/sqlite3').verbose();
const db = new sqlite3.Database('database.live.sqlite');

async function run() {
  const users = [
    { name: 'WACHYU ADI SUSILA', email: 'wachyuadi@gmail.com', pegId: 'emp-1760674693568', usrId: 'user-1760674693644' },
    { name: 'MUHAMMAD ROBANI', email: 'mrobani@gmail.com', pegId: 'emp-1772527032223', usrId: 'user-1772527032290' },
    { name: 'SRI NURANIS', email: 'srinuranis@gmail.com', pegId: 'emp-1760674442484', usrId: 'user-1760674442576' },
    { name: 'KHAERUL MUKMIN,SE', email: 'khaerulmukmin@gmail.com', pegId: 'emp-1760673228372', usrId: 'user-1760673228445' }
  ];

  const results = [];

  for (const u of users) {
    // 1. Get latest login
    const logins = await new Promise(res => {
      db.all(`
        SELECT id, created_at, device, description
        FROM audit_logs
        WHERE user_id = ? OR description LIKE ?
        ORDER BY id DESC LIMIT 5
      `, [u.usrId, `%${u.email}%`], (err, rows) => res(rows || []));
    });

    // 2. Get WLA entries for 2026-07-23 & 2026-07-24
    const wlaToday = await new Promise(res => {
      db.all(`
        SELECT id_log, tanggal, frekuensi, total_durasi_terhitung, status_approval, created_at
        FROM log_aktivitas_harian
        WHERE id_pegawai = ?
          AND (tanggal IN ('2026-07-23', '2026-07-24') OR DATE(created_at) IN ('2026-07-23', '2026-07-24'))
      `, [u.pegId], (err, rows) => res(rows || []));
    });

    // 3. Get last WLA entry overall
    const wlaLast = await new Promise(res => {
      db.get(`
        SELECT id_log, tanggal, created_at, status_approval
        FROM log_aktivitas_harian
        WHERE id_pegawai = ?
        ORDER BY id_log DESC LIMIT 1
      `, [u.pegId], (err, row) => res(row));
    });

    results.push({
      nama: u.name,
      email: u.email,
      login_terakhir: logins[0] ? `${logins[0].created_at} (${logins[0].device})` : 'Tidak ditemukan',
      has_wla_23_24_juli: wlaToday.length > 0 ? `Sudah (${wlaToday.length} entri)` : 'Belum',
      wla_terakhir_tanggal: wlaLast ? wlaLast.tanggal : 'Tidak ada',
      wla_terakhir_input_at: wlaLast ? wlaLast.created_at : 'Tidak ada'
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

run().then(() => db.close());
