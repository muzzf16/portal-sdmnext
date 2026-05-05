import { openDb } from '../../config/db';
import { KreditBerkas, KreditBerkasTracking, CreateKreditBerkasDto } from './kredit-berkas.types';

export const KreditBerkasRepository = {
    async findAll(filters: any = {}) {
        const db = await openDb();
        let query = `SELECT * FROM kredit_berkas WHERE 1=1`;
        const params: any[] = [];

        if (filters.current_stage) {
            query += ` AND current_stage = ?`;
            params.push(filters.current_stage);
        }
        if (filters.overall_status) {
            query += ` AND overall_status = ?`;
            params.push(filters.overall_status);
        }

        query += ` ORDER BY created_at DESC`;
        return db.all(query, params);
    },

    async findById(id: number) {
        const db = await openDb();
        return db.get(`SELECT * FROM kredit_berkas WHERE id = ?`, id);
    },

    async findByNomor(nomor: string) {
        const db = await openDb();
        return db.get(`SELECT * FROM kredit_berkas WHERE nomor_pengajuan = ?`, nomor);
    },

    async getTracking(berkasId: number) {
        const db = await openDb();
        return db.all(`
            SELECT * FROM kredit_berkas_tracking 
            WHERE berkas_id = ? 
            ORDER BY received_at ASC
        `, berkasId);
    },

    async generateNomor() {
        const db = await openDb();
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const prefix = `KRD-${dateStr}-`;
        
        const lastRow = await db.get(
            `SELECT nomor_pengajuan FROM kredit_berkas WHERE nomor_pengajuan LIKE ? ORDER BY id DESC LIMIT 1`,
            `${prefix}%`
        );

        let seq = 1;
        if (lastRow) {
            const lastSeq = parseInt(lastRow.nomor_pengajuan.split('-')[2]);
            seq = lastSeq + 1;
        }

        return `${prefix}${String(seq).padStart(3, '0')}`;
    },

    async create(data: KreditBerkas) {
        const db = await openDb();
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(',');
        const values = Object.values(data);

        const result = await db.run(
            `INSERT INTO kredit_berkas (${columns.join(',')}) VALUES (${placeholders})`,
            values
        );
        
        return result.lastID;
    },

    async update(id: number, data: Partial<KreditBerkas>) {
        const db = await openDb();
        const columns = Object.keys(data);
        const setClause = columns.map(col => `${col} = ?`).join(',');
        const values = [...Object.values(data), id];

        await db.run(
            `UPDATE kredit_berkas SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
    },

    async addTracking(data: KreditBerkasTracking) {
        const db = await openDb();
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(',');
        const values = Object.values(data);

        await db.run(
            `INSERT INTO kredit_berkas_tracking (${columns.join(',')}) VALUES (${placeholders})`,
            values
        );
    },

    async updateTracking(id: number, data: Partial<KreditBerkasTracking>) {
        const db = await openDb();
        const columns = Object.keys(data);
        const setClause = columns.map(col => `${col} = ?`).join(',');
        const values = [...Object.values(data), id];

        await db.run(
            `UPDATE kredit_berkas_tracking SET ${setClause} WHERE id = ?`,
            values
        );
    },

    async getPendingByStage(stage: string) {
        const db = await openDb();
        return db.all(`
            SELECT b.*, t.received_at as stage_received_at 
            FROM kredit_berkas b
            JOIN kredit_berkas_tracking t ON b.id = t.berkas_id
            WHERE b.current_stage = ? 
            AND b.overall_status = 'dalam_proses'
            AND t.stage = ? 
            AND t.completed_at IS NULL
            ORDER BY t.received_at ASC
        `, stage, stage);
    }
};
