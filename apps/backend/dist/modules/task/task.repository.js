"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRepository = void 0;
const db_1 = require("../../config/db");
exports.TaskRepository = {
    async create(data) {
        const db = await (0, db_1.openDb)();
        const id = data.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await db.run(`INSERT INTO assigned_tasks (id, supervisor_id, employee_id, task_name, description, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, id, data.supervisor_id, data.employee_id, data.task_name, data.description || '', 'pending', now, now);
        return this.findById(id);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        return db.get(`
            SELECT t.*, 
                   e.name as employee_name, e.position as employee_position,
                   s.name as supervisor_name
            FROM assigned_tasks t
            JOIN pegawai e ON t.employee_id = e.id
            JOIN pegawai s ON t.supervisor_id = s.id
            WHERE t.id = ?
        `, id);
    },
    async findBySupervisorId(supervisor_id) {
        const db = await (0, db_1.openDb)();
        return db.all(`
            SELECT t.*, 
                   e.name as employee_name, e.position as employee_position
            FROM assigned_tasks t
            JOIN pegawai e ON t.employee_id = e.id
            WHERE t.supervisor_id = ?
            ORDER BY t.created_at DESC
        `, supervisor_id);
    },
    async findByEmployeeId(employee_id, status) {
        const db = await (0, db_1.openDb)();
        let query = `
            SELECT t.*, 
                   s.name as supervisor_name, s.position as supervisor_position
            FROM assigned_tasks t
            JOIN pegawai s ON t.supervisor_id = s.id
            WHERE t.employee_id = ?
        `;
        const params = [employee_id];
        if (status) {
            query += ` AND t.status = ?`;
            params.push(status);
        }
        query += ` ORDER BY t.created_at DESC`;
        return db.all(query, ...params);
    },
    async updateStatus(id, status) {
        const db = await (0, db_1.openDb)();
        const now = new Date().toISOString();
        await db.run(`UPDATE assigned_tasks SET status = ?, updated_at = ? WHERE id = ?`, status, now, id);
        return this.findById(id);
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        await db.run(`DELETE FROM assigned_tasks WHERE id = ?`, id);
        return { success: true };
    }
};
//# sourceMappingURL=task.repository.js.map