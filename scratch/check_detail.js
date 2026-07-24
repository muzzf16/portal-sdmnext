const sqlite3 = require('/opt/portal-sdmv3/apps/backend/node_modules/sqlite3').verbose();
const db = new sqlite3.Database('database.live.sqlite');

async function check() {
  const users = await new Promise((resolve) => {
    db.all(`
      SELECT p.id as pengguna_id, p.name, p.email, p.role, peg.id as pegawai_id, peg.nip
      FROM pengguna p
      LEFT JOIN pegawai peg ON p.employeeId = peg.id OR peg.email = p.email
      WHERE p.email IN ('wachyuadi@gmail.com', 'mrobani@gmail.com', 'srinuranis@gmail.com', 'khaerulmukmin@gmail.com')
         OR p.name LIKE '%WACHYU%' OR p.name LIKE '%ROBANI%' OR p.name LIKE '%SRI NURANIS%' OR p.name LIKE '%KHAERUL%'
    `, [], (err, rows) => resolve(rows));
  });

  console.log("=== DATA AKUN & PEGAWAI ===");
  console.table(users);

  for (const user of users) {
    console.log(`\n======================================================`);
    console.log(`DETAIL UTK: ${user.name} (Email: ${user.email} | Pegawai ID: ${user.pegawai_id})`);
    console.log(`======================================================`);

    // 1. Audit logs (Login)
    const logins = await new Promise((resolve) => {
      db.all(`
        SELECT id, user_id, action, module, description, created_at, device
        FROM audit_logs
        WHERE (user_id = ? OR description LIKE ? OR description LIKE ?)
        ORDER BY id DESC LIMIT 10
      `, [user.pengguna_id, `%${user.email}%`, `%${user.name}%`], (err, rows) => resolve(rows || []));
    });

    console.log(`Log Login Terakhir:`);
    console.table(logins);

    // 2. Entry WLA Harian (log_aktivitas_harian) untuk tanggal 2026-07-23 & 2026-07-24
    const wlaEntries = await new Promise((resolve) => {
      db.all(`
        SELECT id_log, id_pegawai, tanggal, frekuensi, total_durasi_terhitung, status_approval, created_at
        FROM log_aktivitas_harian
        WHERE id_pegawai = ?
          AND (tanggal IN ('2026-07-23', '2026-07-24') OR DATE(created_at) IN ('2026-07-23', '2026-07-24'))
        ORDER BY id_log DESC
      `, [user.pegawai_id], (err, rows) => resolve(rows || []));
    });

    console.log(`Entry WLA Harian (23-24 Juli 2026): ${wlaEntries.length} entri`);
    if (wlaEntries.length > 0) {
      console.table(wlaEntries);
    } else {
      console.log(`-> BELUM ADA ENTRY WLA HARIAN untuk 23-24 Juli 2026!`);
    }

    // 3. Entry WLA Harian paling akhir yang diinput
    const latestWla = await new Promise((resolve) => {
      db.all(`
        SELECT id_log, tanggal, frekuensi, total_durasi_terhitung, status_approval, created_at
        FROM log_aktivitas_harian
        WHERE id_pegawai = ?
        ORDER BY id_log DESC LIMIT 3
      `, [user.pegawai_id], (err, rows) => resolve(rows || []));
    });
    console.log(`Entry WLA Harian Terakhir yang Pernah Diinput:`);
    console.table(latestWla);
  }
}

check().then(() => db.close());
