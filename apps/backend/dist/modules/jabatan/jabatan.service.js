"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jabatan_repository_1 = require("./jabatan.repository");
const errors_1 = require("../../utils/errors");
class JabatanService {
    static async getAll() {
        try {
            return await jabatan_repository_1.JabatanRepository.findAll();
        }
        catch (error) {
            throw new errors_1.AppError(`Error mengambil data jabatan: ${error.message}`, 500);
        }
    }
    static async getById(id) {
        try {
            const jabatan = await jabatan_repository_1.JabatanRepository.findById(id);
            if (!jabatan)
                throw new errors_1.AppError('Jabatan tidak ditemukan', 404);
            return jabatan;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error mengambil data jabatan: ${error.message}`, 500);
        }
    }
    static async getByLevel(level) {
        try {
            return await jabatan_repository_1.JabatanRepository.findByLevel(level);
        }
        catch (error) {
            throw new errors_1.AppError(`Error mengambil jabatan per level: ${error.message}`, 500);
        }
    }
    static async getTree() {
        try {
            return await jabatan_repository_1.JabatanRepository.getTree();
        }
        catch (error) {
            throw new errors_1.AppError(`Error mengambil hierarki jabatan: ${error.message}`, 500);
        }
    }
    static async getTreeWithEmployees() {
        try {
            return await jabatan_repository_1.JabatanRepository.getTreeWithEmployees();
        }
        catch (error) {
            throw new errors_1.AppError(`Error mengambil struktur organisasi: ${error.message}`, 500);
        }
    }
    static async getSubordinates(pegawaiId) {
        try {
            return await jabatan_repository_1.JabatanRepository.getSubordinates(pegawaiId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error mengambil data bawahan: ${error.message}`, 500);
        }
    }
    static async getAllSubordinates(pegawaiId) {
        try {
            return await jabatan_repository_1.JabatanRepository.getAllSubordinates(pegawaiId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error mengambil data bawahan: ${error.message}`, 500);
        }
    }
    static async create(data) {
        try {
            if (!data.nama || data.nama.trim().length < 2) {
                throw new errors_1.AppError('Nama jabatan harus minimal 2 karakter', 400);
            }
            if (!data.level || data.level < 1 || data.level > 10) {
                throw new errors_1.AppError('Level jabatan harus antara 1-10', 400);
            }
            if (data.parent_id) {
                const parent = await jabatan_repository_1.JabatanRepository.findById(data.parent_id);
                if (!parent)
                    throw new errors_1.AppError('Jabatan induk tidak ditemukan', 404);
                if (parent.level >= data.level) {
                    throw new errors_1.AppError('Level jabatan harus lebih tinggi (angka lebih besar) dari jabatan induk', 400);
                }
            }
            return await jabatan_repository_1.JabatanRepository.create(data);
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error membuat jabatan: ${error.message}`, 500);
        }
    }
    static async update(id, data) {
        try {
            const existing = await jabatan_repository_1.JabatanRepository.findById(id);
            if (!existing)
                throw new errors_1.AppError('Jabatan tidak ditemukan', 404);
            if (data.nama !== undefined && data.nama.trim().length < 2) {
                throw new errors_1.AppError('Nama jabatan harus minimal 2 karakter', 400);
            }
            if (data.parent_id === id) {
                throw new errors_1.AppError('Jabatan tidak bisa menjadi induk dari dirinya sendiri', 400);
            }
            return await jabatan_repository_1.JabatanRepository.update(id, data);
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error mengupdate jabatan: ${error.message}`, 500);
        }
    }
    static async delete(id) {
        try {
            const existing = await jabatan_repository_1.JabatanRepository.findById(id);
            if (!existing)
                throw new errors_1.AppError('Jabatan tidak ditemukan', 404);
            const deleted = await jabatan_repository_1.JabatanRepository.delete(id);
            if (!deleted)
                throw new errors_1.AppError('Gagal menghapus jabatan', 500);
            return { message: 'Jabatan berhasil dihapus' };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error menghapus jabatan: ${error.message}`, 500);
        }
    }
}
exports.default = JabatanService;
//# sourceMappingURL=jabatan.service.js.map