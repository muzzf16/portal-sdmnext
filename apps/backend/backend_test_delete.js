const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function run() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.run('PRAGMA foreign_keys = ON');

  const id = 'emp-1772526868641';

  // Tables with employeeId
  const tablesWithEmployeeId = ['absensi', 'permintaan_cuti', 'penggajian', 'penilaian_kinerja', 'kontrak', 'data_change_requests', 'workload_analysis'];
  for (const table of tablesWithEmployeeId) {
    try { await db.run(`DELETE FROM ${table} WHERE employeeId = ?`, id); console.log(`Deleted ${table}`); } catch (e) { console.log(`Error ${table}:`, e.message); }
  }

  // Tables with pegawai_id
  const tablesWithPegawaiId = ['pelatihan', 'riwayat_jabatan'];
  for (const table of tablesWithPegawaiId) {
    try { await db.run(`DELETE FROM ${table} WHERE pegawai_id = ?`, id); console.log(`Deleted ${table}`); } catch (e) { console.log(`Error ${table}:`, e.message); }
  }

  // Tables with employee_id
  const tablesWithEmployeeUnderscoreId = ['tugas_orientasi', 'notifications'];
  for (const table of tablesWithEmployeeUnderscoreId) {
    try { await db.run(`DELETE FROM ${table} WHERE employee_id = ?`, id); console.log(`Deleted ${table}`); } catch (e) { console.log(`Error ${table}:`, e.message); }
  }

  // Tables with id_pegawai
  const tablesWithIdPegawai = ['kpi_targets', 'log_aktivitas_harian', 'pinjaman_karyawan'];
  for (const table of tablesWithIdPegawai) {
    try { await db.run(`DELETE FROM ${table} WHERE id_pegawai = ?`, id); console.log(`Deleted ${table}`); } catch (e) { console.log(`Error ${table}:`, e.message); }
  }

  // Remove employee as supervisor
  try { await db.run(`UPDATE pegawai SET atasan_id = NULL WHERE atasan_id = ?`, id); console.log('Updated atasan_id'); } catch (e) { console.log('Error atasan_id:', e.message); }

  try {
    const result = await db.run('DELETE FROM pegawai WHERE id = ?', id);
    console.log("Final delete result:", result);
  } catch (e) {
    console.log("FINAL DELETE ERROR:", e.message);
  }
}

run();
