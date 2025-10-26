"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PegawaiRepository = void 0;
const db_1 = require("../../config/db");
const parseJsonFields = (rows) => {
    return rows.map(row => ({
        ...row,
        educationHistory: row.educationHistory ? JSON.parse(row.educationHistory) : [],
        workHistory: row.workHistory ? JSON.parse(row.workHistory) : [],
        trainingCertificates: row.trainingCertificates ? JSON.parse(row.trainingCertificates) : [],
        payrollInfo: row.payrollInfo ? JSON.parse(row.payrollInfo) : { baseSalary: 0, incomes: [], deductions: [] },
    }));
};
exports.PegawaiRepository = {
    async findAll() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM pegawai ORDER BY name ASC');
        return parseJsonFields(rows);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM pegawai WHERE id = ?', id);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async findByEmail(email) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM pegawai WHERE email = ?', email);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
        const newId = data.id || `emp-${Date.now()}`;
        const pegawaiData = {
            id: newId,
            name: data.name,
            nip: data.nip || `NIP${Date.now().toString().slice(-4)}`,
            position: data.position || 'N/A',
            pangkat: data.pangkat || 'N/A',
            golongan: data.golongan || 'N/A',
            department: data.department || 'N/A',
            joinDate: data.joinDate || new Date().toISOString().split('T')[0],
            avatarUrl: data.avatarUrl || '/avatars/default-avatar.jpg',
            leaveBalance: data.leaveBalance ?? 18,
            isActive: data.hasOwnProperty('isActive') ? (data.isActive ? 1 : 0) : 1,
            address: data.address || '',
            phone: data.phone || '',
            pob: data.pob || '',
            dob: data.dob || '',
            religion: data.religion || 'Lainnya',
            maritalStatus: data.maritalStatus || 'Lajang',
            numberOfChildren: data.numberOfChildren ?? 0,
            educationHistory: JSON.stringify(data.educationHistory || []),
            workHistory: JSON.stringify(data.workHistory || []),
            trainingCertificates: JSON.stringify(data.trainingCertificates || []),
            payrollInfo: JSON.stringify(data.payrollInfo || { baseSalary: 0, incomes: [], deductions: [] }),
        };
        const columns = Object.keys(pegawaiData);
        const placeholders = columns.map(() => '?').join(',');
        const values = Object.values(pegawaiData);
        await db.run(`INSERT INTO pegawai (${columns.join(',')}) VALUES (${placeholders})`, values);
        const newRow = await db.get('SELECT * FROM pegawai WHERE id = ?', newId);
        return parseJsonFields([newRow])[0];
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        const fieldsToUpdate = {
            ...data,
            educationHistory: JSON.stringify(data.educationHistory || []),
            workHistory: JSON.stringify(data.workHistory || []),
            trainingCertificates: JSON.stringify(data.trainingCertificates || []),
            payrollInfo: JSON.stringify(data.payrollInfo || {}),
            isActive: data.hasOwnProperty('isActive') ? (data.isActive ? 1 : 0) : 1
        };
        delete fieldsToUpdate.id;
        const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), id];
        const result = await db.run(`UPDATE pegawai SET ${setClause} WHERE id = ?`, values);
        if (result.changes === 0)
            throw new Error('Employee not found');
        const updatedRow = await db.get('SELECT * FROM pegawai WHERE id = ?', id);
        return parseJsonFields([updatedRow])[0];
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM pegawai WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    },
    async updatePayrollInfo(id, payrollInfo) {
        const db = await (0, db_1.openDb)();
        const result = await db.run(`UPDATE pegawai SET payrollInfo = ? WHERE id = ?`, JSON.stringify(payrollInfo), id);
        if (result.changes === 0)
            throw new Error('Employee not found');
        return { message: 'Payroll info updated' };
    }
};
//# sourceMappingURL=pegawai.repository.js.map