import { openDb } from '../../config/db';
import {
    ActivityLibraryFilters,
    ActivityLibraryItem,
    CreateActivityLibraryPayload,
} from './activity-library.types';

export const ActivityLibraryRepository = {

    async findAll(filters?: ActivityLibraryFilters): Promise<ActivityLibraryItem[]> {
        const db = await openDb();
        let query = 'SELECT * FROM activity_library';
        const params: Array<string | number> = [];
        const conditions: string[] = ['IFNULL(is_active, 1) = 1'];

        if (filters?.position) {
            conditions.push('(LOWER(position) = LOWER(?) OR LOWER(position) = \'semua jabatan\')');
            params.push(filters.position);
        }
        if (filters?.department) {
            conditions.push('department = ?');
            params.push(filters.department);
        }
        if (filters?.category) {
            conditions.push('category = ?');
            params.push(filters.category);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY position, activityName ASC';

        return db.all(query, ...params);
    },

    async findByPosition(position: string): Promise<ActivityLibraryItem[]> {
        const db = await openDb();
        return db.all(
            'SELECT * FROM activity_library WHERE (LOWER(position) = LOWER(?) OR LOWER(position) = \'semua jabatan\') AND IFNULL(is_active, 1) = 1 ORDER BY activityName ASC',
            position
        );
    },

    async findExact(position: string, activityName: string): Promise<ActivityLibraryItem | null> {
        const db = await openDb();
        const row = await db.get<ActivityLibraryItem>(
            'SELECT * FROM activity_library WHERE LOWER(position) = LOWER(?) AND LOWER(activityName) = LOWER(?) AND IFNULL(is_active, 1) = 1',
            position, activityName
        );
        return row || null;
    },

    async findById(id: string): Promise<ActivityLibraryItem | null> {
        const db = await openDb();
        const row = await db.get<ActivityLibraryItem>('SELECT * FROM activity_library WHERE id = ?', id);
        return row || null;
    },

    async getPositions(): Promise<string[]> {
        const db = await openDb();
        const rows = await db.all('SELECT DISTINCT position FROM activity_library WHERE IFNULL(is_active, 1) = 1 ORDER BY position ASC') as Array<{ position: string }>;
        return rows.map((row) => row.position);
    },

    async create(data: CreateActivityLibraryPayload): Promise<ActivityLibraryItem | null> {
        const db = await openDb();
        const id = data.id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            id, data.position, data.department || '', data.activityName,
            data.durationMinutes || 0, data.outputUnit || '', data.category || '', data.default_nominal, now
        );
        return this.findById(id);
    },

    async update(id: string, data: CreateActivityLibraryPayload): Promise<ActivityLibraryItem | null> {
        const db = await openDb();
        const result = await db.run(
            `UPDATE activity_library SET position = ?, department = ?, activityName = ?, 
             durationMinutes = ?, outputUnit = ?, category = ?, default_nominal = ? WHERE id = ?`,
            data.position, data.department, data.activityName,
            data.durationMinutes, data.outputUnit, data.category, data.default_nominal, id
        );
        if (result.changes === 0) return null;
        return this.findById(id);
    },

    async delete(id: string) {
        const db = await openDb();
        const result = await db.run('DELETE FROM activity_library WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    },

    async softDelete(id: string) {
        const db = await openDb();
        const result = await db.run('UPDATE activity_library SET is_active = 0 WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};

