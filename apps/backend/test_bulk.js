const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
(async () => {
    try {
        const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });
        const logs = [{
            id_pegawai: 1,
            tanggal: '2023-10-10',
            id_activity_library: 'act-1',
            frekuensi: 2,
            total_durasi_terhitung: 60,
            catatan: 'Test test',
            lampiran: null
        }];
        const placeholders = logs.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
        const values = logs.flatMap(log => [
            log.id_pegawai,
            log.tanggal,
            log.id_activity_library,
            log.frekuensi,
            log.total_durasi_terhitung,
            log.catatan || null,
            log.lampiran || null
        ]);
        const result = await db.run(
            `INSERT INTO log_aktivitas_harian 
             (id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, catatan, lampiran) 
             VALUES ${placeholders}`,
            ...values
        );
        console.log('Success', result);
    } catch (e) {
        console.error('Error:', e.message);
    }
})();
