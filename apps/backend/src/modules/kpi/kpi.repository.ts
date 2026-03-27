import { openDb } from '../../config/db';
import {
    CreateKpiPayload,
    KpiFilters,
    KpiSummaryEmployee,
    KpiSummaryEmployeeScope,
    KpiSummaryRecord,
    KpiTarget,
    UpdateKpiPayload,
} from './kpi.types';

export const KpiRepository = {

    async findAll(filters?: KpiFilters): Promise<KpiTarget[]> {
        const db = await openDb();
        let query = 'SELECT * FROM kpi_targets';
        const params: string[] = [];
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

        return db.all(query, ...params) as Promise<KpiTarget[]>;
    },

    async findByEmployeeId(employeeId: string): Promise<KpiTarget[]> {
        const db = await openDb();
        return db.all(
            'SELECT * FROM kpi_targets WHERE employeeId = ? ORDER BY period DESC, kpiName ASC',
            employeeId
        ) as Promise<KpiTarget[]>;
    },

    async findByEmployeePeriod(employeeId: string, period: string): Promise<KpiTarget[]> {
        const db = await openDb();
        return db.all(
            'SELECT * FROM kpi_targets WHERE employeeId = ? AND period = ? ORDER BY kpiName ASC',
            employeeId, period
        ) as Promise<KpiTarget[]>;
    },

    async findById(id: string): Promise<KpiTarget | null> {
        const db = await openDb();
        const row = await db.get('SELECT * FROM kpi_targets WHERE id = ?', id) as KpiTarget | undefined;
        return row || null;
    },

    async findSummaryEmployees(filters?: KpiSummaryEmployeeScope): Promise<KpiSummaryEmployee[]> {
        const db = await openDb();
        const params: string[] = [];
        const conditions = [`(p.isActive = 1 OR p.statusKaryawan = 'aktif')`];

        if (filters?.employeeId) {
            conditions.push('p.id = ?');
            params.push(filters.employeeId);
        }

        if (filters?.employeeIds && filters.employeeIds.length > 0) {
            const placeholders = filters.employeeIds.map(() => '?').join(', ');
            conditions.push(`p.id IN (${placeholders})`);
            params.push(...filters.employeeIds);
        }

        return db.all(
            `SELECT
                p.id AS employeeId,
                p.name AS employeeName,
                p.nip AS nip,
                p.department AS department,
                p.position AS position
             FROM pegawai p
             WHERE ${conditions.join(' AND ')}
             ORDER BY p.department ASC, p.name ASC`,
            ...params
        ) as Promise<KpiSummaryEmployee[]>;
    },

    async findSummaryRecords(filters?: KpiSummaryEmployeeScope & { period?: string }): Promise<KpiSummaryRecord[]> {
        const db = await openDb();
        const params: string[] = [];
        const conditions: string[] = [];

        if (filters?.employeeId) {
            conditions.push('k.employeeId = ?');
            params.push(filters.employeeId);
        }

        if (filters?.employeeIds && filters.employeeIds.length > 0) {
            const placeholders = filters.employeeIds.map(() => '?').join(', ');
            conditions.push(`k.employeeId IN (${placeholders})`);
            params.push(...filters.employeeIds);
        }

        if (filters?.period) {
            conditions.push('k.period = ?');
            params.push(filters.period);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        return db.all(
            `SELECT
                k.id,
                k.employeeId,
                k.period,
                k.weight,
                k.score,
                k.status,
                p.name AS employeeName,
                p.nip AS nip,
                p.department AS department,
                p.position AS position
             FROM kpi_targets k
             JOIN pegawai p ON p.id = k.employeeId
             ${whereClause}
             ORDER BY p.name ASC, k.period DESC, k.kpiName ASC`,
            ...params
        ) as Promise<KpiSummaryRecord[]>;
    },

    async findSummary(filters: { period: string; employeeId?: string; employeeIds?: string[] }) {
        const db = await openDb();
        const params: any[] = [filters.period];
        const conditions = ['k.period = ?'];

        if (filters.employeeId) {
            conditions.push('k.employeeId = ?');
            params.push(filters.employeeId);
        }

        if (filters.employeeIds && filters.employeeIds.length > 0) {
            const placeholders = filters.employeeIds.map(() => '?').join(', ');
            conditions.push(`k.employeeId IN (${placeholders})`);
            params.push(...filters.employeeIds);
        }

        return db.all(
            `SELECT
                p.id AS employeeId,
                p.name AS employeeName,
                p.nip AS nip,
                p.department AS department,
                p.position AS position,
                COUNT(k.id) AS totalKpi,
                COALESCE(SUM(COALESCE(k.weight, 0)), 0) AS totalWeight,
                COALESCE(
                    SUM(COALESCE(k.score, 0) * COALESCE(k.weight, 0)) / NULLIF(SUM(COALESCE(k.weight, 0)), 0),
                    0
                ) AS weightedScore,
                SUM(CASE WHEN k.status = 'draft' THEN 1 ELSE 0 END) AS draftCount,
                SUM(CASE WHEN k.status = 'waiting_approval' THEN 1 ELSE 0 END) AS waitingApprovalCount,
                SUM(CASE WHEN k.status = 'active' THEN 1 ELSE 0 END) AS activeCount,
                SUM(CASE WHEN k.status = 'completed' THEN 1 ELSE 0 END) AS completedCount
             FROM kpi_targets k
             JOIN pegawai p ON p.id = k.employeeId
             WHERE ${conditions.join(' AND ')}
             GROUP BY p.id, p.name, p.nip, p.department, p.position
             ORDER BY p.name ASC`,
            ...params
        );
    },

    async create(data: CreateKpiPayload): Promise<KpiTarget | null> {
        const db = await openDb();
        const id = data.id || `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO kpi_targets (id, employeeId, period, kpiName, targetValue, targetUnit, weight, actualValue, score, status, source, category, abkActivityId, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            id, data.employeeId, data.period, data.kpiName,
            data.targetValue || 0, data.targetUnit || '', data.weight || 0,
            data.actualValue || 0, data.score || 0,
            data.status || 'active', data.source || 'manual',
            data.category || 'process',
            data.abkActivityId || null, data.notes || '', now, now
        );
        return this.findById(id);
    },

    async update(id: string, data: UpdateKpiPayload): Promise<KpiTarget | null> {
        const db = await openDb();
        const now = new Date().toISOString();

        // Build dynamic update
        const fields: string[] = [];
        const values: Array<string | number | null> = [];

        const allowedFields: Array<keyof UpdateKpiPayload> = [
            'kpiName',
            'targetValue',
            'targetUnit',
            'weight',
            'actualValue',
            'score',
            'status',
            'source',
            'category',
            'abkActivityId',
            'notes',
        ];

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
