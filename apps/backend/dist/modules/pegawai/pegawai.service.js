"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_repository_1 = require("./pegawai.repository");
const errors_1 = require("../../utils/errors");
const pengguna_repository_1 = require("../pengguna/pengguna.repository");
const jabatan_repository_1 = require("../jabatan/jabatan.repository");
const db_1 = require("../../config/db");
class PegawaiService {
    static async getAllPegawai() {
        try {
            return await pegawai_repository_1.PegawaiRepository.findAll();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving employees: ${error.message}`, 500);
        }
    }
    static async getPegawaiById(id) {
        try {
            const pegawai = await pegawai_repository_1.PegawaiRepository.findById(id);
            if (!pegawai) {
                throw new errors_1.AppError('Employee not found', 404);
            }
            return pegawai;
        }
        catch (error) {
            if (error.message === 'Employee not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error retrieving employee: ${error.message}`, 500);
        }
    }
    static validatePegawaiData(data, isUpdate = false) {
        const errors = [];
        if (!isUpdate) {
            if (!data.name || data.name.trim().length < 2) {
                errors.push('Nama harus minimal 2 karakter');
            }
            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.push('Format email tidak valid');
            }
        }
        else {
            if (data.name !== undefined && data.name.trim().length < 2) {
                errors.push('Nama harus minimal 2 karakter');
            }
            if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.push('Format email tidak valid');
            }
        }
        if (data.jenis_kelamin && !['L', 'P'].includes(data.jenis_kelamin)) {
            errors.push('Jenis kelamin harus L (Laki-laki) atau P (Perempuan)');
        }
        if (data.phone && !/^[0-9+\-\s()]*$/.test(data.phone)) {
            errors.push('Format nomor telepon tidak valid');
        }
        if (data.dob && !/^\d{4}-\d{2}-\d{2}$/.test(data.dob)) {
            errors.push('Format tanggal lahir harus YYYY-MM-DD');
        }
        if (data.joinDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.joinDate)) {
            errors.push('Format tanggal masuk harus YYYY-MM-DD');
        }
        if (errors.length > 0) {
            throw new errors_1.AppError(errors.join('; '), 400);
        }
    }
    static async resolveJabatanFields(data) {
        if (data.jabatan_id) {
            const jabatan = await jabatan_repository_1.JabatanRepository.findById(Number(data.jabatan_id));
            if (jabatan) {
                data.position = jabatan.nama;
                data.department = jabatan.department || data.department;
            }
        }
        return data;
    }
    static async createPegawai(name, email, pegawaiData) {
        try {
            PegawaiService.validatePegawaiData({ ...pegawaiData, name, email });
            const existingByEmail = await pegawai_repository_1.PegawaiRepository.findByEmail(email);
            if (existingByEmail) {
                throw new errors_1.AppError('Email sudah terdaftar', 400);
            }
            if (pegawaiData.nip) {
                const existingByNip = await pegawai_repository_1.PegawaiRepository.findByNip(pegawaiData.nip);
                if (existingByNip) {
                    throw new errors_1.AppError('NIP sudah terdaftar', 400);
                }
            }
            const enrichedData = await PegawaiService.resolveJabatanFields({ ...pegawaiData, name, email });
            const newPegawai = await pegawai_repository_1.PegawaiRepository.create(enrichedData);
            return newPegawai;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error creating employee: ${error.message}`, 500);
        }
    }
    static async updatePegawai(id, name, email, pegawaiData) {
        try {
            PegawaiService.validatePegawaiData({ ...pegawaiData, name, email }, true);
            const existing = await pegawai_repository_1.PegawaiRepository.findById(id);
            if (!existing) {
                throw new errors_1.AppError('Pegawai tidak ditemukan', 404);
            }
            if (email && email !== existing.email) {
                const existingByEmail = await pegawai_repository_1.PegawaiRepository.findByEmail(email);
                if (existingByEmail && existingByEmail.id !== id) {
                    throw new errors_1.AppError('Email sudah digunakan pegawai lain', 400);
                }
            }
            const enrichedData = await PegawaiService.resolveJabatanFields({ ...pegawaiData, name, email });
            const updatedPegawai = await pegawai_repository_1.PegawaiRepository.update(id, enrichedData);
            try {
                const db = await (0, db_1.openDb)();
                const linkedUser = await db.get('SELECT * FROM pengguna WHERE employeeId = ?', id);
                if (linkedUser) {
                    const syncData = {};
                    if (name)
                        syncData.name = name;
                    if (email)
                        syncData.email = email;
                    if (Object.keys(syncData).length > 0) {
                        await pengguna_repository_1.PenggunaRepository.update(linkedUser.id, syncData);
                    }
                }
            }
            catch (syncError) {
                console.error('Warning: Failed to sync user data:', syncError.message);
            }
            return updatedPegawai;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error updating employee: ${error.message}`, 500);
        }
    }
    static async deletePegawai(id) {
        try {
            const existing = await pegawai_repository_1.PegawaiRepository.findById(id);
            if (!existing) {
                throw new errors_1.AppError('Pegawai tidak ditemukan', 404);
            }
            try {
                const db = await (0, db_1.openDb)();
                const linkedUser = await db.get('SELECT * FROM pengguna WHERE employeeId = ?', id);
                if (linkedUser) {
                    await pengguna_repository_1.PenggunaRepository.delete(linkedUser.id);
                }
            }
            catch (syncError) {
                console.error('Warning: Failed to delete linked user:', syncError.message);
            }
            const deleted = await pegawai_repository_1.PegawaiRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('Gagal menghapus pegawai', 500);
            }
            return { message: 'Pegawai dan akun terkait berhasil dihapus' };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error deleting employee: ${error.message}`, 500);
        }
    }
    static async updatePegawaiPayrollInfo(id, payrollInfo) {
        try {
            return await pegawai_repository_1.PegawaiRepository.updatePayrollInfo(id, payrollInfo);
        }
        catch (error) {
            if (error.message === 'Employee not found') {
                throw new errors_1.AppError('Employee not found', 404);
            }
            throw new errors_1.AppError(`Error updating employee payroll info: ${error.message}`, 500);
        }
    }
    static async getGenderDistribution() {
        try {
            return await pegawai_repository_1.PegawaiRepository.getGenderDistribution();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving gender distribution: ${error.message}`, 500);
        }
    }
    static async getEducationDistribution() {
        try {
            return await pegawai_repository_1.PegawaiRepository.getEducationDistribution();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving education distribution: ${error.message}`, 500);
        }
    }
    static async getDepartmentDistribution() {
        try {
            return await pegawai_repository_1.PegawaiRepository.getDepartmentDistribution();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving department distribution: ${error.message}`, 500);
        }
    }
}
exports.default = PegawaiService;
//# sourceMappingURL=pegawai.service.js.map