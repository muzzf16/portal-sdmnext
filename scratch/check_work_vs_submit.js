const sqlite3 = require('/opt/portal-sdmv3/apps/backend/node_modules/sqlite3').verbose();
const db = new sqlite3.Database('database.live.sqlite');

async function run() {
  const users = [
    { name: 'WACHYU ADI SUSILA', email: 'wachyuadi@gmail.com', pegId: 'emp-1760674693568', usrId: 'user-1760674693644' },
    { name: 'MUHAMMAD ROBANI', email: 'mrobani@gmail.com', pegId: 'emp-1772527032223', usrId: 'user-1772527032290' },
    { name: 'SRI NURANIS', email: 'srinuranis@gmail.com', pegId: 'emp-1760674442484', usrId: 'user-1760674442576' },
    { name: 'KHAERUL MUKMIN,SE', email: 'khaerulmukmin@gmail.com', pegId: 'emp-1760673228372', usrId: 'user-1760673228445' }
  ];

  for (const u of users) {
    console.log(`\n==============================================`);
    console.log(`PEGAWAI: ${u.name}`);

    // Check entries with work date (tanggal) = '2026-07-23' or '2026-07-24'
    const workDateEntries = await new Promise(res => {
      db.all(`
        SELECT id_log, tanggal, frekuensi, total_durasi_terhitung, status_approval, created_at
        FROM log_aktivitas_harian
        WHERE id_pegawai = ? AND tanggal IN ('2026-07-23', '2026-07-24')
      `, [u.pegId], (e, r) => res(r || []));
    });

    console.log(`-> Entri untuk Tanggal Kerja (23-24 Juli 2026): ${workDateEntries.length} entri`);

    // Check entries created ON 2026-07-23 or 2026-07-24
    const createdDateEntries = await new Promise(res => {
      db.all(`
        SELECT id_log, tanggal, frekuensi, total_durasi_terhitung, status_approval, created_at
        FROM log_aktivitas_harian
        WHERE id_pegawai = ? AND DATE(created_at) IN ('2026-07-23', '2026-07-24')
      `, [u.pegId], (e, r) => res(r || []));
    });

    console.log(`-> Entri yang Di-submit pada Tanggal (23-24 Juli 2026): ${createdDateEntries.length} entri`);
    if (createdDateEntries.length > 0) {
      console.log(`   Detail entri yang di-submit:`);
      console.table(createdDateEntries.slice(0, 5)); // show first 5
    }
  }
}

run().then(() => db.close());
