"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TugasOrientasiRepository = void 0;
const db_1 = require("../../config/db");
exports.TugasOrientasiRepository = {
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM tugas_orientasi WHERE employee_id = ?', employeeId);
        return rows;
    },
    async create(employeeId, data) {
        const db = await (0, db_1.openDb)();
        const { task_name, description, due_date, completed } = data;
        const result = await db.run('INSERT INTO tugas_orientasi (employee_id, task_name, description, due_date, completed) VALUES (?, ?, ?, ?, ?)', employeeId, task_name, description, due_date, completed ? 1 : 0);
        return { id: result.lastID, employee_id: employeeId, ...data };
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        const { task_name, description, due_date, completed } = data;
        const result = await db.run('UPDATE tugas_orientasi SET task_name = ?, description = ?, due_date = ?, completed = ? WHERE id = ?', task_name, description, due_date, completed ? 1 : 0, id);
        if (result.changes === 0)
            throw new Error('Onboarding task not found');
        return { id, ...data };
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM tugas_orientasi WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};
//# sourceMappingURL=tugasOrientasi.repository.js.map