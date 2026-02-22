import { openDb } from '../../config/db';

export const KpiRepository = {

    async findAll(filters?: { employeeId?: string; period?: string; status?: string }) {
        const db = await openDb();
        let query = 'SELECT * FROM kpi_targets';
        const params: any[] = [];
        const conditions: string[] = [];

        if (filters?.employeeId) {
            conditions.push('employeeId = ?');
            params.push(filters.employeeId);
        }
        if (filters?.period) {
            conditions.push('period = ?');
            params.push(filters.period);
        }
        if (filters?.status) {
            conditions.push('status = ?');
            params.push(filters.status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';

        return db.all(query, ...params);
    },

    async findByEmployeeId(employeeId: string) {
        const db = await openDb();
        return db.all(
            'SELECT * FROM kpi_targets WHERE employeeId = ? ORDER BY period DESC, kpiName ASC',
            employeeId
        );
    },

    async findByEmployeePeriod(employeeId: string, period: string) {
        const db = await openDb();
        return db.all(
            'SELECT * FROM kpi_targets WHERE employeeId = ? AND period = ? ORDER BY kpiName ASC',
            employeeId, period
        );
    },

    async findById(id: string) {
        const db = await openDb();
        return db.get('SELECT * FROM kpi_targets WHERE id = ?', id);
    },

    async create(data: any) {
        const db = await openDb();
        const id = data.id || `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO kpi_targets (id, employeeId, period, kpiName, targetValue, targetUnit, weight, actualValue, score, status, source, abkActivityId, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            id, data.employeeId, data.period, data.kpiName,
            data.targetValue || 0, data.targetUnit || '', data.weight || 0,
            data.actualValue || 0, data.score || 0,
            data.status || 'active', data.source || 'manual',
            data.abkActivityId || null, data.notes || '', now, now
        );
        return this.findById(id);
    },

    async update(id: string, data: any) {
        const db = await openDb();
        const now = new Date().toISOString();

        // Build dynamic update
        const fields: string[] = [];
        const values: any[] = [];

        const allowedFields = ['kpiName', 'targetValue', 'targetUnit', 'weight', 'actualValue', 'score', 'status', 'source', 'abkActivityId', 'notes'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        const result = await db.run(
            `UPDATE kpi_targets SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
        if (result.changes === 0) return null;
        return this.findById(id);
    },

    async updateActualValue(id: string, actualValue: number, score: number, evidenceUrl?: string) {
        const db = await openDb();
        const now = new Date().toISOString();
        if (evidenceUrl) {
            const result = await db.run(
                `UPDATE kpi_targets SET actualValue = ?, score = ?, evidenceUrl = ?, updated_at = ? WHERE id = ?`,
                actualValue, score, evidenceUrl, now, id
            );
            if (result.changes === 0) return null;
        } else {
            const result = await db.run(
                `UPDATE kpi_targets SET actualValue = ?, score = ?, updated_at = ? WHERE id = ?`,
                actualValue, score, now, id
            );
            if (result.changes === 0) return null;
        }
        return this.findById(id);
    },

    async updateEvidence(id: string, evidenceUrl: string) {
        const db = await openDb();
        const now = new Date().toISOString();
        const result = await db.run(
            `UPDATE kpi_targets SET evidenceUrl = ?, updated_at = ? WHERE id = ?`,
            evidenceUrl, now, id
        );
        if (result.changes === 0) return null;
        return this.findById(id);
    },

    async delete(id: string) {
        const db = await openDb();
        const result = await db.run('DELETE FROM kpi_targets WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};
