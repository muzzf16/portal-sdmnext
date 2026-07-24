import { openDb } from '../../config/db';
import { CreateLaporanKepatuhanPayload, LaporanKepatuhanItem, UpdateLaporanKepatuhanPayload, LaporanStatus } from './laporan-kepatuhan.types';

export const LaporanKepatuhanRepository = {
    async create(data: CreateLaporanKepatuhanPayload): Promise<LaporanKepatuhanItem | null> {
        const db = await openDb();
        const result = await db.run(
            `INSERT INTO laporan_kepatuhan 
             (nama_laporan, ketentuan, periode, tata_cara, batas_akhir, bagian, employee_id, keterangan)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            data.nama_laporan,
            data.ketentuan || null,
            data.periode || null,
            data.tata_cara || null,
            data.batas_akhir,
            data.bagian || null,
            data.employee_id || null,
            data.keterangan || null
        );
        return this.findById(result.lastID as number);
    },

    async findById(id: number): Promise<LaporanKepatuhanItem | null> {
        const db = await openDb();
        const row = await db.get(`
            SELECT l.*, p.name as employee_name, s.name as supervisor_name
            FROM laporan_kepatuhan l
            LEFT JOIN pegawai p ON l.employee_id = p.id
            LEFT JOIN pegawai s ON l.bagian = CAST(s.id AS TEXT)
            WHERE l.id = ?
        `, id);
        return (row as LaporanKepatuhanItem) || null;
    },

    async findAll(status?: LaporanStatus, employee_id?: string): Promise<LaporanKepatuhanItem[]> {
        const db = await openDb();
        let query = `
            SELECT l.*, p.name as employee_name, s.name as supervisor_name
            FROM laporan_kepatuhan l
            LEFT JOIN pegawai p ON l.employee_id = p.id
            LEFT JOIN pegawai s ON l.bagian = CAST(s.id AS TEXT)
        `;
        const params: any[] = [];
        const conditions: string[] = [];

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

        return db.all(query, ...params) as Promise<LaporanKepatuhanItem[]>;
    },

    async findByEmployeeId(employee_id: string, status?: LaporanStatus): Promise<LaporanKepatuhanItem[]> {
        const db = await openDb();
        let query = `
            SELECT l.*, p.name as employee_name, s.name as supervisor_name
            FROM laporan_kepatuhan l
            LEFT JOIN pegawai p ON l.employee_id = p.id
            LEFT JOIN pegawai s ON l.bagian = CAST(s.id AS TEXT)
            WHERE l.employee_id = ?
        `;
        const params: any[] = [employee_id];

        if (status) {
            query += ` AND l.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY l.batas_akhir ASC`;

        return db.all(query, ...params) as Promise<LaporanKepatuhanItem[]>;
    },

    async update(id: number, data: UpdateLaporanKepatuhanPayload): Promise<LaporanKepatuhanItem | null> {
        const db = await openDb();
        const updates: string[] = [];
        const params: any[] = [];

        if (data.nama_laporan !== undefined) { updates.push('nama_laporan = ?'); params.push(data.nama_laporan); }
        if (data.ketentuan !== undefined) { updates.push('ketentuan = ?'); params.push(data.ketentuan); }
        if (data.periode !== undefined) { updates.push('periode = ?'); params.push(data.periode); }
        if (data.tata_cara !== undefined) { updates.push('tata_cara = ?'); params.push(data.tata_cara); }
        if (data.batas_akhir !== undefined) { updates.push('batas_akhir = ?'); params.push(data.batas_akhir); }
        if (data.bagian !== undefined) { updates.push('bagian = ?'); params.push(data.bagian); }
        if (data.employee_id !== undefined) { updates.push('employee_id = ?'); params.push(data.employee_id); }
        if (data.status !== undefined) { updates.push('status = ?'); params.push(data.status); }
        if (data.keterangan !== undefined) { updates.push('keterangan = ?'); params.push(data.keterangan); }
        if (data.tanggal_diselesaikan !== undefined) { updates.push('tanggal_diselesaikan = ?'); params.push(data.tanggal_diselesaikan); }
        if (data.lampiran !== undefined) { updates.push('lampiran = ?'); params.push(data.lampiran); }

        updates.push('updated_at = CURRENT_TIMESTAMP');

        params.push(id);

        if (updates.length > 1) { // 1 because updated_at is always there
            await db.run(`UPDATE laporan_kepatuhan SET ${updates.join(', ')} WHERE id = ?`, ...params);
        }
        
        return this.findById(id);
    },

    async delete(id: number) {
        const db = await openDb();
        await db.run(`DELETE FROM laporan_kepatuhan WHERE id = ?`, id);
        return { success: true };
    },

    // For schedulers: get pending reports that are due in exactly X days
    async findPendingDueInDays(days: number): Promise<LaporanKepatuhanItem[]> {
        const db = await openDb();
        // SQLite date function can be used to compare date bounds
        return db.all(`
            SELECT l.*, p.name as employee_name, p.user_id 
            FROM laporan_kepatuhan l
            LEFT JOIN pegawai p ON l.employee_id = p.id
            WHERE l.status = 'pending' 
            AND l.employee_id IS NOT NULL
            AND date(l.batas_akhir) = date('now', 'localtime', '+' || ? || ' days')
        `, days) as Promise<LaporanKepatuhanItem[]>;
    },
    
    // For schedulers: get overdue pending reports
    async findOverduePending(): Promise<LaporanKepatuhanItem[]> {
        const db = await openDb();
        return db.all(`
            SELECT l.*, p.name as employee_name, p.user_id 
            FROM laporan_kepatuhan l
            LEFT JOIN pegawai p ON l.employee_id = p.id
            WHERE l.status = 'pending' 
            AND l.employee_id IS NOT NULL
            AND date(l.batas_akhir) < date('now', 'localtime')
        `) as Promise<LaporanKepatuhanItem[]>;
    }
};
