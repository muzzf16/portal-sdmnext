"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenggajianRepository = void 0;
const db_1 = require("../../config/db");
const parseJsonFields = (rows) => {
    return rows.map(row => {
        const grossSalary = row.baseSalary + row.totalIncome;
        return {
            ...row,
            incomes: row.incomes ? JSON.parse(row.incomes) : [],
            deductions: row.deductions ? JSON.parse(row.deductions) : [],
            grossSalary,
        };
    });
};
exports.PenggajianRepository = {
    async findAll(query = {}) {
        const db = await (0, db_1.openDb)();
        let sql = 'SELECT * FROM penggajian';
        const params = [];
        const whereClauses = [];
        if (query.employeeId) {
            whereClauses.push('employeeId = ?');
            params.push(query.employeeId);
        }
        if (query.search) {
            whereClauses.push('employeeName LIKE ?');
            params.push(`%${query.search}%`);
        }
        if (query.period) {
            whereClauses.push('period = ?');
            params.push(query.period);
        }
        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }
        const rows = await db.all(sql, params);
        return parseJsonFields(rows);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM penggajian WHERE id = ?', id);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM penggajian WHERE employeeId = ?', employeeId);
        return parseJsonFields(rows);
    },
    async findByEmployeeIdAndPeriod(employeeId, period) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM penggajian WHERE employeeId = ? AND period = ?', [employeeId, period]);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
        const newId = data.id || `payroll-${Date.now()}`;
        const totalIncome = data.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0;
        const totalDeductions = data.deductions?.reduce((sum, ded) => sum + ded.amount, 0) || 0;
        const netSalary = data.baseSalary + totalIncome - totalDeductions;
        const payrollData = {
            id: newId,
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            period: data.period,
            baseSalary: data.baseSalary,
            incomes: JSON.stringify(data.incomes || []),
            deductions: JSON.stringify(data.deductions || []),
            totalIncome,
            totalDeductions,
            netSalary
        };
        await db.run('INSERT INTO penggajian (id, employeeId, employeeName, period, baseSalary, incomes, deductions, totalIncome, totalDeductions, netSalary) VALUES (?,?,?,?,?,?,?,?,?,?)', Object.values(payrollData));
        const newRow = await db.get('SELECT * FROM penggajian WHERE id = ?', newId);
        return parseJsonFields([newRow])[0];
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        const totalIncome = data.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0;
        const totalDeductions = data.deductions?.reduce((sum, ded) => sum + ded.amount, 0) || 0;
        const netSalary = data.baseSalary + totalIncome - totalDeductions;
        const payrollData = {
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            period: data.period,
            baseSalary: data.baseSalary,
            incomes: JSON.stringify(data.incomes || []),
            deductions: JSON.stringify(data.deductions || []),
            totalIncome,
            totalDeductions,
            netSalary
        };
        const setClause = Object.keys(payrollData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(payrollData), id];
        const result = await db.run(`UPDATE penggajian SET ${setClause} WHERE id = ?`, values);
        if (result.changes === 0)
            throw new Error('Payroll not found');
        const updatedRow = await db.get('SELECT * FROM penggajian WHERE id = ?', id);
        return parseJsonFields([updatedRow])[0];
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM penggajian WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    },
    async findRecentlyProcessed() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all(`
      SELECT * FROM penggajian 
      WHERE datetime('now') - datetime(created_at) <= 86400  -- Last 24 hours
      ORDER BY created_at DESC
    `);
        return parseJsonFields(rows);
    }
};
//# sourceMappingURL=penggajian.repository.js.map