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
        const rows = await db.all(`
      SELECT p.*, 
        j.nama as jabatanNama, j.level as jabatanLevel, j.department as jabatanDepartment,
        a.name as atasanNama
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      LEFT JOIN pegawai a ON p.atasan_id = a.id
      ORDER BY p.name ASC
    `);
        return parseJsonFields(rows);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get(`
      SELECT p.*, 
        j.nama as jabatanNama, j.level as jabatanLevel, j.department as jabatanDepartment,
        a.name as atasanNama, a.nip as atasanNip
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      LEFT JOIN pegawai a ON p.atasan_id = a.id
      WHERE p.id = ?
    `, id);
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
    async findByNip(nip) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM pegawai WHERE nip = ?', nip);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async generateNip() {
        const db = await (0, db_1.openDb)();
        const year = new Date().getFullYear();
        const result = await db.get('SELECT COUNT(*) as count FROM pegawai WHERE nip LIKE ?', `${year}%`);
        const seq = (result?.count || 0) + 1;
        return `${year}${String(seq).padStart(4, '0')}`;
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
        const newId = data.id || `emp-${Date.now()}`;
        const nip = data.nip || await this.generateNip();
        const pegawaiData = {
            id: newId,
            name: data.name,
            nip,
            email: data.email,
            position: data.position || 'N/A',
            pangkat: data.pangkat || 'N/A',
            golongan: data.golongan || 'N/A',
            department: data.department || 'N/A',
            joinDate: data.joinDate || new Date().toISOString().split('T')[0],
            avatarUrl: data.avatarUrl || '/avatars/default-avatar.jpg',
            jenis_kelamin: data.jenis_kelamin || null,
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
            tanggalKeluar: data.tanggal_keluar || null,
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
        const validColumns = [
            'name', 'nip', 'email', 'position', 'pangkat', 'golongan', 'department',
            'joinDate', 'avatarUrl', 'leaveBalance', 'isActive', 'address', 'phone',
            'pob', 'dob', 'religion', 'maritalStatus', 'numberOfChildren',
            'educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo',
            'jenis_kelamin', 'tanggalKeluar', 'jabatan_id', 'atasan_id'
        ];
        const fieldsToUpdate = {};
        for (const key of Object.keys(data)) {
            if (validColumns.includes(key)) {
                fieldsToUpdate[key] = data[key];
            }
        }
        if (fieldsToUpdate.hasOwnProperty('educationHistory')) {
            fieldsToUpdate.educationHistory = JSON.stringify(fieldsToUpdate.educationHistory || []);
        }
        if (fieldsToUpdate.hasOwnProperty('workHistory')) {
            fieldsToUpdate.workHistory = JSON.stringify(fieldsToUpdate.workHistory || []);
        }
        if (fieldsToUpdate.hasOwnProperty('trainingCertificates')) {
            fieldsToUpdate.trainingCertificates = JSON.stringify(fieldsToUpdate.trainingCertificates || []);
        }
        if (fieldsToUpdate.hasOwnProperty('payrollInfo')) {
            fieldsToUpdate.payrollInfo = JSON.stringify(fieldsToUpdate.payrollInfo || {});
        }
        if (fieldsToUpdate.hasOwnProperty('isActive')) {
            fieldsToUpdate.isActive = fieldsToUpdate.isActive ? 1 : 0;
        }
        if (Object.keys(fieldsToUpdate).length === 0) {
            const currentRow = await this.findById(id);
            if (!currentRow)
                throw new Error('Employee not found');
            return currentRow;
        }
        const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), id];
        const result = await db.run(`UPDATE pegawai SET ${setClause} WHERE id = ?`, values);
        if (result.changes === 0) {
            const existing = await this.findById(id);
            if (!existing)
                throw new Error('Employee not found');
        }
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
    },
    async getGenderDistribution() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT jenis_kelamin FROM pegawai WHERE jenis_kelamin IS NOT NULL');
        const genderCount = { 'L': 0, 'P': 0, 'Other': 0 };
        rows.forEach(row => {
            if (row.jenis_kelamin === 'L') {
                genderCount['L']++;
            }
            else if (row.jenis_kelamin === 'P') {
                genderCount['P']++;
            }
            else {
                genderCount['Other']++;
            }
        });
        return [
            { name: 'Laki-laki', value: genderCount['L'] },
            { name: 'Perempuan', value: genderCount['P'] },
            ...(genderCount['Other'] > 0 ? [{ name: 'Lainnya', value: genderCount['Other'] }] : [])
        ];
    },
    async getEducationDistribution() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT educationHistory FROM pegawai WHERE educationHistory IS NOT NULL AND educationHistory != \'[]\'');
        const educationCount = {};
        rows.forEach(row => {
            if (row.educationHistory && row.educationHistory !== '[]') {
                try {
                    const educationHistory = JSON.parse(row.educationHistory);
                    if (Array.isArray(educationHistory) && educationHistory.length > 0) {
                        educationHistory.forEach(edu => {
                            const level = edu.level || edu.jenjang_pendidikan || 'Tidak Diketahui';
                            educationCount[level] = (educationCount[level] || 0) + 1;
                        });
                    }
                }
                catch (e) {
                    console.error('Error parsing educationHistory:', e);
                }
            }
        });
        return Object.entries(educationCount).map(([name, employees]) => ({ name, employees }));
    },
    async getDepartmentDistribution() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all(`
      SELECT COALESCE(j.department, p.department, 'Belum Ditetapkan') as dept, COUNT(*) as count
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      WHERE p.isActive = 1 OR p.statusKaryawan = 'aktif'
      GROUP BY dept
      ORDER BY count DESC
    `);
        return rows.map((r) => ({ name: r.dept, value: r.count }));
    },
    async getEmployeeReportData() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all(`
      SELECT id, nip, name, email, position, department, joinDate, jenis_kelamin, isActive, tanggalKeluar
      FROM pegawai
      ORDER BY name ASC
    `);
        return rows;
    },
    async findByAtasanId(atasanId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all(`
      SELECT p.*, 
        j.nama as jabatanNama, j.level as jabatanLevel, j.department as jabatanDepartment
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      WHERE p.atasan_id = ? AND (p.isActive = 1 OR p.statusKaryawan = 'aktif')
      ORDER BY p.name ASC
    `, atasanId);
        return parseJsonFields(rows);
    },
    async getSupervisorStats(atasanId) {
        const db = await (0, db_1.openDb)();
        const total = await db.get(`SELECT COUNT(*) as count FROM pegawai WHERE atasan_id = ? AND (isActive = 1 OR statusKaryawan = 'aktif')`, atasanId);
        const today = new Date().toISOString().split('T')[0];
        const present = await db.get(`SELECT COUNT(a.id) as count 
       FROM absensi a
       JOIN pegawai p ON a.employeeId = p.id
       WHERE p.atasan_id = ? AND a.date = ? AND a.status = 'hadir'`, atasanId, today);
        const onLeave = await db.get(`SELECT COUNT(a.id) as count 
       FROM absensi a
       JOIN pegawai p ON a.employeeId = p.id
       WHERE p.atasan_id = ? AND a.date = ? AND a.status IN ('izin', 'sakit', 'cuti')`, atasanId, today);
        const pendingLeaves = await db.get(`SELECT COUNT(c.id) as count
       FROM permintaan_cuti c
       JOIN pegawai p ON c.employeeId = p.id
       WHERE p.atasan_id = ? AND c.status = 'menunggu'`, atasanId);
        return {
            totalTeam: total?.count || 0,
            presentToday: present?.count || 0,
            onLeaveToday: onLeave?.count || 0,
            pendingLeaves: pendingLeaves?.count || 0
        };
    }
};
//# sourceMappingURL=pegawai.repository.js.map