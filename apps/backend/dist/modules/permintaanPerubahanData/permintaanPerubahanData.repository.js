"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermintaanPerubahanDataRepository = void 0;
const db_1 = require("../../config/db");
const parseJsonFields = (rows) => {
    return rows;
};
exports.PermintaanPerubahanDataRepository = {
    async findAll() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM permintaan_perubahan_data');
        return parseJsonFields(rows);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM permintaan_perubahan_data WHERE id = ?', id);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM permintaan_perubahan_data WHERE employeeId = ?', employeeId);
        return parseJsonFields(rows);
    },
    async findPending() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all("SELECT * FROM permintaan_perubahan_data WHERE status = 'Menunggu'");
        return parseJsonFields(rows);
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
        const newId = data.id || `dcr-${Date.now()}`;
        const requestData = {
            id: newId,
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            requestDate: new Date().toISOString().split('T')[0],
            message: data.message,
            status: 'Menunggu'
        };
        await db.run('INSERT INTO permintaan_perubahan_data (id, employeeId, employeeName, requestDate, message, status) VALUES (?,?,?,?,?,?)', Object.values(requestData));
        const newRow = await db.get('SELECT * FROM permintaan_perubahan_data WHERE id = ?', newId);
        return parseJsonFields([newRow])[0];
    },
    async updateStatus(id, status) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('UPDATE permintaan_perubahan_data SET status = ? WHERE id = ?', status, id);
        if (result.changes === 0)
            throw new Error('Data change request not found');
        return { message: 'Request status updated' };
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM permintaan_perubahan_data WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};
//# sourceMappingURL=permintaanPerubahanData.repository.js.map