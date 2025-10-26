"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenggunaRepository = void 0;
const db_1 = require("../../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const pegawai_repository_1 = require("../pegawai/pegawai.repository");
exports.PenggunaRepository = {
    async findAll() {
        const db = await (0, db_1.openDb)();
        return db.all('SELECT * FROM pengguna');
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        return db.get('SELECT * FROM pengguna WHERE id = ?', id);
    },
    async findByEmail(email) {
        const db = await (0, db_1.openDb)();
        return db.get('SELECT * FROM pengguna WHERE email = ?', email);
    },
    async create(userData) {
        const db = await (0, db_1.openDb)();
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already exists');
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(userData.password, salt);
        const newUserId = `user-${Date.now()}`;
        const newEmployeeId = `emp-${Date.now()}`;
        const newEmployeeData = {
            id: newEmployeeId,
            name: userData.name,
            nip: `NIP${Date.now().toString().slice(-4)}`,
            position: 'Staf Junior',
            pangkat: 'Staf',
            golongan: 'II/a',
            department: 'Belum Ditentukan',
            joinDate: new Date().toISOString().split('T')[0],
            avatarUrl: `/avatars/default-avatar.jpg`,
            leaveBalance: 18,
            isActive: 1,
            address: '',
            phone: '',
            pob: '',
            dob: '',
            religion: 'Lainnya',
            maritalStatus: 'Lajang',
            numberOfChildren: 0,
            educationHistory: '[]',
            workHistory: '[]',
            trainingCertificates: '[]',
            payrollInfo: JSON.stringify({ baseSalary: 5000000, incomes: [], deductions: [] })
        };
        await db.run('BEGIN TRANSACTION');
        try {
            const empColumns = Object.keys(newEmployeeData);
            const empPlaceholders = empColumns.map(() => '?').join(',');
            await db.run(`INSERT INTO pegawai (${empColumns.join(',')}) VALUES (${empPlaceholders})`, Object.values(newEmployeeData));
            await db.run('INSERT INTO pengguna (id, name, email, password, role, employeeId) VALUES (?,?,?,?,?,?)', [newUserId, userData.name, userData.email, hashedPassword, userData.role || 'EMPLOYEE', newEmployeeId]);
            await db.run('COMMIT');
            const user = await db.get('SELECT * FROM pengguna WHERE id = ?', newUserId);
            const employee = await pegawai_repository_1.PegawaiRepository.findById(newEmployeeId);
            user.employeeDetails = employee;
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    },
    async authenticate(email, password) {
        const db = await (0, db_1.openDb)();
        const user = await this.findByEmail(email);
        if (!user) {
            throw new Error("User not found.");
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials.");
        }
        const employee = await pegawai_repository_1.PegawaiRepository.findById(user.employeeId);
        user.employeeDetails = employee;
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('UPDATE pengguna SET name = ?, email = ? WHERE id = ?', [data.name, data.email, id]);
        if (result.changes === 0)
            throw new Error('User not found');
        const updatedUser = await this.findById(id);
        return updatedUser;
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM pengguna WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};
//# sourceMappingURL=pengguna.repository.js.map