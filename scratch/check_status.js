const sqlite3 = require('/opt/portal-sdmv3/apps/backend/node_modules/sqlite3').verbose();

const dbs = ['database.live.sqlite', 'database.sqlite'];

for (const dbPath of dbs) {
  console.log(`\n==================================================`);
  console.log(`DATABASE FILE: ${dbPath}`);
  console.log(`==================================================`);

  const db = new sqlite3.Database(dbPath);

  db.all(`
    SELECT p.id as pengguna_id, p.name, p.email, p.employeeId, peg.id as pegawai_id, peg.nip
    FROM pengguna p
    LEFT JOIN pegawai peg ON p.employeeId = peg.id OR peg.email = p.email
    WHERE p.email IN ('wachyuadi@gmail.com', 'mrobani@gmail.com', 'srinuranis@gmail.com', 'khaerulmukmin@gmail.com')
       OR p.name LIKE '%WACHYU%' OR p.name LIKE '%ROBANI%' OR p.name LIKE '%SRI NURANIS%' OR p.name LIKE '%KHAERUL%'
  `, [], (err, users) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('\n--- TARGET USERS ---');
    console.table(users);

    const userIds = users.map(u => u.pengguna_id);
    const pegIds = users.map(u => u.pegawai_id);
    const emails = users.map(u => u.email);

    // 1. Check Login Logs
    console.log('\n--- LOG LOGIN / AUDIT LOGS TERBARU ---');
    db.all(`
      SELECT id, user_id, action, module, description, created_at, device
      FROM audit_logs
      WHERE user_id IN ('${userIds.join("','")}')
         OR description LIKE '%wachyuadi%'
         OR description LIKE '%mrobani%'
         OR description LIKE '%srinuranis%'
         OR description LIKE '%khaerul%'
      ORDER BY id DESC
      LIMIT 30
    `, [], (err, auditLogs) => {
      if (err) console.error(err);
      console.table(auditLogs);

      // 2. Check WLA Harian (log_aktivitas_harian)
      console.log('\n--- LOG AKTIVITAS HARIAN (log_aktivitas_harian) TERBARU ---');
      db.all(`
        SELECT id_log, id_pegawai, tanggal, frekuensi, total_durasi_terhitung, status_approval, created_at
        FROM log_aktivitas_harian
        WHERE id_pegawai IN ('${pegIds.join("','")}')
        ORDER BY id_log DESC
        LIMIT 30
      `, [], (err, dailyLogs) => {
        if (err) console.error(err);
        console.table(dailyLogs);

        // Check specific dates: 2026-07-23 & 2026-07-24
        console.log('\n--- DETAIL REKAP ENTRY WLA HARIAN PER TANGGAL (2026-07-23 & 2026-07-24) ---');
        db.all(`
          SELECT 
            peg.name as nama_pegawai,
            lah.tanggal,
            COUNT(lah.id_log) as total_entry,
            SUM(lah.frekuensi) as total_frekuensi,
            SUM(lah.total_durasi_terhitung) as total_durasi_menit
          FROM log_aktivitas_harian lah
          JOIN pegawai peg ON lah.id_pegawai = peg.id
          WHERE lah.id_pegawai IN ('${pegIds.join("','")}')
            AND lah.tanggal IN ('2026-07-23', '2026-07-24', '2026-07-22')
          GROUP BY lah.id_pegawai, lah.tanggal
          ORDER BY lah.tanggal DESC, peg.name ASC
        `, [], (err, summary) => {
          if (err) console.error(err);
          console.table(summary);
        });
      });
    });
  });
}
