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
        const rows = await db.all(`
      SELECT k.*, p.name as employeeName, p.position, p.department
      FROM kontrak k 
      LEFT JOIN pegawai p ON k.employeeId = p.id 
      ORDER BY k.startDate DESC
    `);
        return parseJsonFields(rows);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get(`
      SELECT k.*, p.name as employeeName, p.position, p.department
      FROM kontrak k 
      LEFT JOIN pegawai p ON k.employeeId = p.id 
      WHERE k.id = ?
    `, id);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all(`
      SELECT k.*, p.name as employeeName, p.position, p.department
      FROM kontrak k 
      LEFT JOIN pegawai p ON k.employeeId = p.id 
      WHERE k.employeeId = ? 
      ORDER BY k.startDate DESC
    `, employeeId);
        return parseJsonFields(rows);
    },
    async create(contractData) {
        const db = await (0, db_1.openDb)();
        const id = contractData.id || `kontrak-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const contractNumber = contractData.contractNumber || `CNT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const createdAt = new Date().toISOString();
        let employeeName = contractData.employeeName;
        if (!employeeName && contractData.employeeId) {
            const employee = await db.get('SELECT name FROM pegawai WHERE id = ?', contractData.employeeId);
            employeeName = employee?.name || null;
        }
        await db.run(`INSERT INTO kontrak (id, employeeId, contractNumber, contractType, startDate, endDate, status, contractFile, terms, salary, notes, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, contractData.employeeId, contractNumber, contractData.contractType, contractData.startDate, contractData.endDate, contractData.status, contractData.contractFile || null, contractData.terms || null, contractData.salary || null, contractData.notes || null, createdAt);
        const newRow = await db.get(`
      SELECT k.*, p.name as employeeName, p.position, p.department
      FROM kontrak k 
      LEFT JOIN pegawai p ON k.employeeId = p.id 
      WHERE k.id = ?
    `, id);
        return parseJsonFields([newRow])[0];
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