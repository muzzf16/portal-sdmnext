const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.serialize(() => {
  db.get("PRAGMA foreign_keys = ON");
  db.run("BEGIN TRANSACTION");
  
  // manually delete the standard ones
  const id = 'emp-1772526868641';
  db.run("DELETE FROM absensi WHERE employeeId = ?", id);
  db.run("DELETE FROM permintaan_cuti WHERE employeeId = ?", id);
  db.run("DELETE FROM penggajian WHERE employeeId = ?", id);
  db.run("DELETE FROM penilaian_kinerja WHERE employeeId = ?", id);
  db.run("DELETE FROM kontrak WHERE employeeId = ?", id);
  db.run("DELETE FROM data_change_requests WHERE employeeId = ?", id);
  db.run("DELETE FROM pelatihan WHERE pegawai_id = ?", id);
  db.run("DELETE FROM riwayat_jabatan WHERE pegawai_id = ?", id);
  db.run("DELETE FROM tugas_orientasi WHERE employee_id = ?", id);
  db.run("DELETE FROM notifications WHERE employee_id = ?", id);
  db.run("DELETE FROM kpi_targets WHERE employeeId = ?", id);
  db.run("DELETE FROM log_aktivitas_harian WHERE id_pegawai = ?", id);
  db.run("DELETE FROM pinjaman_karyawan WHERE id_pegawai = ?", id);
  db.run("UPDATE pegawai SET atasan_id = NULL WHERE atasan_id = ?", id);
  
  db.run("DELETE FROM pegawai WHERE id = ?", id, function(err) {
    if (err) {
      console.log("Error deleting pegawai:", err.message);
    } else {
      console.log("Success! Changes:", this.changes);
    }
  });
  
  db.run("ROLLBACK");
});
