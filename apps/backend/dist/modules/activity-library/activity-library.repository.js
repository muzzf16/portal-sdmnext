"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLibraryRepository = void 0;
const db_1 = require("../../config/db");
exports.ActivityLibraryRepository = {
    async findAll(filters) {
        const db = await (0, db_1.openDb)();
        let query = 'SELECT * FROM activity_library';
        const params = [];
        const conditions = [];
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
    async findByPosition(position) {
        const db = await (0, db_1.openDb)();
        return db.all('SELECT * FROM activity_library WHERE LOWER(position) = LOWER(?) OR LOWER(position) = \'semua jabatan\' ORDER BY activityName ASC', position);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        return db.get('SELECT * FROM activity_library WHERE id = ?', id);
    },
    async getPositions() {
        const db = await (0, db_1.openDb)();
        return db.all('SELECT DISTINCT position FROM activity_library ORDER BY position ASC');
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
        const id = data.id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await db.run(`INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, id, data.position, data.department || '', data.activityName, data.durationMinutes || 0, data.outputUnit || '', data.category || '', now);
        return this.findById(id);
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        const result = await db.run(`UPDATE activity_library SET position = ?, department = ?, activityName = ?, 
             durationMinutes = ?, outputUnit = ?, category = ? WHERE id = ?`, data.position, data.department, data.activityName, data.durationMinutes, data.outputUnit, data.category, id);
        if (result.changes === 0)
            return null;
        return this.findById(id);
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM activity_library WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};
//# sourceMappingURL=activity-library.repository.js.map