"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../config/db");
class LogAktivitasHarianRepository {
    static async create(payload) {
        const db = await (0, db_1.openDb)();
        const result = await db.run(`INSERT INTO log_aktivitas_harian 
             (id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, catatan) 
             VALUES (?, ?, ?, ?, ?, ?)`, payload.id_pegawai, payload.tanggal, payload.id_activity_library, payload.frekuensi, payload.total_durasi_terhitung, payload.catatan || null);
        return { id_log: result.lastID, ...payload };
    }
    static async createBulk(id_pegawai, tanggal, logs) {
        const db = await (0, db_1.openDb)();
        await db.run('DELETE FROM log_aktivitas_harian WHERE id_pegawai = ? AND tanggal = ?', id_pegawai, tanggal);
        if (!logs || logs.length === 0)
            return { message: `Existing logs cleared. No new logs inserted.`, changes: 0 };
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
        const result = await db.run(`INSERT INTO log_aktivitas_harian 
             (id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, catatan, lampiran) 
             VALUES ${placeholders}`, ...values);
        return { message: `${logs.length} logs inserted successfully`, changes: result.changes };
    }
    static async getByPegawaiAndDate(id_pegawai, tanggal) {
        const db = await (0, db_1.openDb)();
        return db.all(`SELECT l.*, a.activityName, a.durationMinutes, a.outputUnit, a.category 
             FROM log_aktivitas_harian l
             JOIN activity_library a ON l.id_activity_library = a.id
             WHERE l.id_pegawai = ? AND l.tanggal = ?
             ORDER BY l.created_at DESC`, id_pegawai, tanggal);
    }
    static async getSummaryByPegawai(id_pegawai, startDate, endDate) {
        const db = await (0, db_1.openDb)();
        return db.get(`SELECT 
                SUM(frekuensi) as total_aktivitas,
                SUM(total_durasi_terhitung) as total_durasi_menit
             FROM log_aktivitas_harian
             WHERE id_pegawai = ? AND tanggal >= ? AND tanggal <= ? AND status_approval IN ('pending', 'approved')`, id_pegawai, startDate, endDate);
    }
    static async getAllByDate(tanggal) {
        const db = await (0, db_1.openDb)();
        return db.all(`SELECT 
                p.id as id_pegawai, p.name as nama_lengkap, p.nip, p.position as jabatan, p.department as departemen,
                SUM(CASE WHEN l.status_approval IS NULL OR l.status_approval != 'rejected' THEN l.frekuensi ELSE 0 END) as total_aktivitas,
                SUM(CASE WHEN l.status_approval IS NULL OR l.status_approval != 'rejected' THEN l.total_durasi_terhitung ELSE 0 END) as total_durasi_menit,
                COUNT(CASE WHEN l.status_approval IS NULL OR l.status_approval != 'rejected' THEN 1 END) as jumlah_log
             FROM pegawai p
             LEFT JOIN log_aktivitas_harian l ON p.id = l.id_pegawai AND l.tanggal = ?
             GROUP BY p.id
             ORDER BY p.department, p.name ASC`, tanggal);
    }
    static async updateStatus(id_log, status) {
        const db = await (0, db_1.openDb)();
        await db.run(`UPDATE log_aktivitas_harian SET status_approval = ?, updated_at = CURRENT_TIMESTAMP WHERE id_log = ?`, status, id_log);
        return { id_log, status_approval: status };
    }
}
exports.default = LogAktivitasHarianRepository;
//# sourceMappingURL=log-aktivitas-harian.repository.js.map