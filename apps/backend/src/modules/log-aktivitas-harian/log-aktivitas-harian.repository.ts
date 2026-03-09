import { openDb } from '../../config/db';

export default class LogAktivitasHarianRepository {

    static async create(payload: { id_pegawai: string | number, tanggal: string, id_activity_library: string | number, frekuensi: number, total_durasi_terhitung: number, catatan?: string }) {
        const db = await openDb();
        const result = await db.run(
            `INSERT INTO log_aktivitas_harian 
             (id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, catatan) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            payload.id_pegawai,
            payload.tanggal,
            payload.id_activity_library,
            payload.frekuensi,
            payload.total_durasi_terhitung,
            payload.catatan || null
        );
        return { id_log: result.lastID, ...payload };
    }

    static async createBulk(id_pegawai: string | number, tanggal: string, logs: { id_pegawai: string | number, tanggal: string, id_activity_library: string | number, frekuensi: number, total_durasi_terhitung: number, catatan?: string, lampiran?: string }[]) {
        const db = await openDb();

        // Delete existing logs to prevent duplicates
        await db.run('DELETE FROM log_aktivitas_harian WHERE id_pegawai = ? AND tanggal = ?', id_pegawai, tanggal);

        if (!logs || logs.length === 0) return { message: `Existing logs cleared. No new logs inserted.`, changes: 0 };

        // Construct bulk insert values
        // Note: SQLite supports bulk insert via multiple VALUES clauses
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
        return { message: `${logs.length} logs inserted successfully`, changes: result.changes };
    }

    static async getByPegawaiAndDateRange(id_pegawai: string | number, startDate: string, endDate: string) {
        const db = await openDb();
        return db.all(
            `SELECT l.*, a.activityName, a.durationMinutes, a.outputUnit, a.category 
             FROM log_aktivitas_harian l
             JOIN activity_library a ON l.id_activity_library = a.id
             WHERE l.id_pegawai = ? AND l.tanggal >= ? AND l.tanggal <= ?
             ORDER BY l.tanggal DESC, l.created_at DESC`,
            id_pegawai,
            startDate,
            endDate
        );
    }

    static async getSummaryByPegawai(id_pegawai: string | number, startDate: string, endDate: string) {
        const db = await openDb();
        return db.get(
            `SELECT 
                SUM(frekuensi) as total_aktivitas,
                SUM(total_durasi_terhitung) as total_durasi_menit
             FROM log_aktivitas_harian
             WHERE id_pegawai = ? AND tanggal >= ? AND tanggal <= ? AND status_approval IN ('pending', 'approved')`,
            id_pegawai, startDate, endDate
        );
    }

    static async getAllByDateRange(startDate: string, endDate: string, supervisorId?: string) {
        const db = await openDb();

        let supervisorJoin = '';
        let supervisorWhere = `WHERE p.isActive = 1 OR p.statusKaryawan = 'aktif'`;
        const params: any[] = [startDate, endDate];

        if (supervisorId) {
            const supervisor = await db.get('SELECT jabatan_id FROM pegawai WHERE id = ?', supervisorId);
            if (!supervisor || !supervisor.jabatan_id) return [];

            supervisorJoin = 'JOIN jabatan j ON p.jabatan_id = j.id';
            supervisorWhere += ' AND j.parent_id = ?';
            params.push(supervisor.jabatan_id);
        }

        // Aggregating per employee for the admin dashboard
        // Only count logs that are NOT rejected (pending or approved)
        return db.all(
            `SELECT 
                p.id as id_pegawai, p.name as nama_lengkap, p.nip, p.position as jabatan, p.department as departemen,
                SUM(CASE WHEN l.id_log IS NOT NULL AND (l.status_approval IS NULL OR l.status_approval != 'rejected') THEN l.frekuensi ELSE 0 END) as total_aktivitas,
                SUM(CASE WHEN l.id_log IS NOT NULL AND (l.status_approval IS NULL OR l.status_approval != 'rejected') THEN l.total_durasi_terhitung ELSE 0 END) as total_durasi_menit,
                COUNT(CASE WHEN l.id_log IS NOT NULL AND (l.status_approval IS NULL OR l.status_approval != 'rejected') THEN l.id_log END) as jumlah_log
             FROM pegawai p
             ${supervisorJoin}
             LEFT JOIN log_aktivitas_harian l ON p.id = l.id_pegawai AND l.tanggal >= ? AND l.tanggal <= ?
             ${supervisorWhere}
             GROUP BY p.id
             ORDER BY p.department, p.name ASC`,
            ...params
        );
    }

    static async updateStatus(id_log: number, status: 'approved' | 'rejected') {
        const db = await openDb();
        await db.run(
            `UPDATE log_aktivitas_harian SET status_approval = ?, updated_at = CURRENT_TIMESTAMP WHERE id_log = ?`,
            status, id_log
        );
        return { id_log, status_approval: status };
    }
}
