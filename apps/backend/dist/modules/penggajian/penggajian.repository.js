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
    async findAll() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM penggajian');
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
            ...data,
            incomes: JSON.stringify(data.incomes || []),
            deductions: JSON.stringify(data.deductions || []),
            totalIncome,
            totalDeductions,
            netSalary
        };
        delete payrollData.id;
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
    }
};
//# sourceMappingURL=penggajian.repository.js.map