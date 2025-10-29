"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KontrakRepository = void 0;
const db_1 = require("../../config/db");
const parseJsonFields = (rows) => {
    return rows;
};
exports.KontrakRepository = {
    async findAll() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM kontrak ORDER BY startDate DESC');
        return parseJsonFields(rows);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM kontrak WHERE id = ?', id);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM kontrak WHERE employeeId = ? ORDER BY startDate DESC', employeeId);
        return parseJsonFields(rows);
    },
    async create(contractData) {
        const db = await (0, db_1.openDb)();
        const result = await db.run(`INSERT INTO kontrak (employeeId, contractNumber, contractType, startDate, endDate, status, contractFile, terms, salary, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, contractData.employeeId, contractData.contractNumber, contractData.contractType, contractData.startDate, contractData.endDate, contractData.status, contractData.contractFile, contractData.terms, contractData.salary, contractData.notes);
        return { id: result.lastID, ...contractData };
    },
    async update(id, contractData) {
        const db = await (0, db_1.openDb)();
        await db.run(`UPDATE kontrak SET employeeId = ?, contractNumber = ?, contractType = ?, startDate = ?, endDate = ?, 
       status = ?, contractFile = ?, terms = ?, salary = ?, notes = ? WHERE id = ?`, contractData.employeeId, contractData.contractNumber, contractData.contractType, contractData.startDate, contractData.endDate, contractData.status, contractData.contractFile, contractData.terms, contractData.salary, contractData.notes, id);
        return { id, ...contractData };
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        await db.run('DELETE FROM kontrak WHERE id = ?', id);
        return { id };
    },
    async findExpiringContracts() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all(`
      SELECT * FROM kontrak 
      WHERE status = 'active' 
      AND endDate IN (
        date('now', '+30 days'),
        date('now', '+14 days'),
        date('now', '+7 days')
      )
    `);
        return parseJsonFields(rows);
    }
};
//# sourceMappingURL=kontrak.repository.js.map