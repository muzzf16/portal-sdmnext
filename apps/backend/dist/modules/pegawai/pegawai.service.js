"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_repository_1 = require("./pegawai.repository");
const errors_1 = require("../../utils/errors");
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
    static async createPegawai(name, email, pegawaiData) {
        try {
            const newPegawai = await pegawai_repository_1.PegawaiRepository.create({
                ...pegawaiData,
                name,
                email
            });
            return newPegawai;
        }
        catch (error) {
            if (error.message === 'Email already exists') {
                throw new errors_1.AppError('Email already exists', 400);
            }
            throw new errors_1.AppError(`Error creating employee: ${error.message}`, 500);
        }
    }
    static async updatePegawai(id, name, email, pegawaiData) {
        try {
            const updatedPegawai = await pegawai_repository_1.PegawaiRepository.update(id, {
                ...pegawaiData,
                name,
                email
            });
            return updatedPegawai;
        }
        catch (error) {
            if (error.message === 'Employee not found') {
                throw new errors_1.AppError('Employee not found', 404);
            }
            throw new errors_1.AppError(`Error updating employee: ${error.message}`, 500);
        }
    }
    static async deletePegawai(id) {
        try {
            const deleted = await pegawai_repository_1.PegawaiRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('Employee not found', 404);
            }
            return { message: 'Employee deleted successfully' };
        }
        catch (error) {
            if (error.message === 'Employee not found') {
                throw error;
            }
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
}
exports.default = PegawaiService;
//# sourceMappingURL=pegawai.service.js.map