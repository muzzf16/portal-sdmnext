"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permintaanCuti_repository_1 = require("./permintaanCuti.repository");
const company_settings_repository_1 = require("../company-settings/company-settings.repository");
const errors_1 = require("../../utils/errors");
class CutiService {
    static async getAllPermintaanCuti(query) {
        try {
            return await permintaanCuti_repository_1.PermintaanCutiRepository.findAll(query);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving leave requests: ${error.message}`, 500);
        }
    }
    static async getPermintaanCutiById(id) {
        try {
            const request = await permintaanCuti_repository_1.PermintaanCutiRepository.findById(id);
            if (!request) {
                throw new errors_1.AppError('Leave request not found', 404);
            }
            return request;
        }
        catch (error) {
            if (error.message === 'Leave request not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error retrieving leave request: ${error.message}`, 500);
        }
    }
    static async getPermintaanCutiByEmployeeId(employeeId) {
        try {
            return await permintaanCuti_repository_1.PermintaanCutiRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving leave requests: ${error.message}`, 500);
        }
    }
    static async submitPermintaanCuti(requestData) {
        try {
            return await permintaanCuti_repository_1.PermintaanCutiRepository.create(requestData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error submitting leave request: ${error.message}`, 500);
        }
    }
    static async updateStatusCuti(id, status, rejectionReason) {
        try {
            return await permintaanCuti_repository_1.PermintaanCutiRepository.updateStatus(id, status, rejectionReason);
        }
        catch (error) {
            if (error.message.includes('not found')) {
                throw new errors_1.AppError(error.message, 404);
            }
            throw new errors_1.AppError(`Error updating leave request status: ${error.message}`, 500);
        }
    }
    static async deletePermintaanCuti(id) {
        try {
            const deleted = await permintaanCuti_repository_1.PermintaanCutiRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('Leave request not found', 404);
            }
            return { message: 'Leave request deleted successfully' };
        }
        catch (error) {
            if (error.message === 'Leave request not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error deleting leave request: ${error.message}`, 500);
        }
    }
    static async getSisaCuti(employeeId) {
        try {
            const approvedLeaves = await permintaanCuti_repository_1.PermintaanCutiRepository.findApprovedByEmployeeId(employeeId);
            const annualApprovedLeaves = approvedLeaves.filter((cutiItem) => {
                const type = (cutiItem.leaveType || '').toLowerCase();
                return type === 'tahunan' || type === 'annual' || type === 'cuti tahunan';
            });
            let totalCutiDiambil = 0;
            annualApprovedLeaves.forEach(cutiItem => {
                const startDate = new Date(cutiItem.startDate);
                const endDate = new Date(cutiItem.endDate);
                const timeDiff = endDate.getTime() - startDate.getTime();
                const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                totalCutiDiambil += dayDiff;
            });
            const companySettings = await (0, company_settings_repository_1.getCompanySettings)();
            const jumlahJatahCuti = companySettings?.annualLeaveQuota || 12;
            const cutiBersama = [
                { id: '1', tanggal: '2026-01-01', deskripsi: 'Tahun Baru 2026' },
                { id: '2', tanggal: '2026-03-31', deskripsi: 'Hari Raya Idul Fitri' },
                { id: '3', tanggal: '2026-04-01', deskripsi: 'Cuti Bersama Idul Fitri' },
                { id: '4', tanggal: '2026-05-01', deskripsi: 'Hari Buruh Internasional' },
                { id: '5', tanggal: '2026-08-17', deskripsi: 'Hari Kemerdekaan RI' },
                { id: '6', tanggal: '2026-12-25', deskripsi: 'Hari Natal' },
                { id: '7', tanggal: '2026-12-26', deskripsi: 'Cuti Bersama Natal' },
            ];
            const currentYear = new Date().getFullYear();
            const cutiBersamaTahunIni = cutiBersama.filter(c => new Date(c.tanggal).getFullYear() === currentYear).length;
            const sisaCuti = jumlahJatahCuti - totalCutiDiambil - cutiBersamaTahunIni;
            return {
                jatahCuti: jumlahJatahCuti,
                cutiDiambil: totalCutiDiambil,
                cutiBersama: cutiBersamaTahunIni,
                sisaCuti: sisaCuti,
                sumberJatah: companySettings ? 'company_settings' : 'default_uu13_2003',
            };
        }
        catch (error) {
            throw new errors_1.AppError(`Error calculating remaining leave: ${error.message}`, 500);
        }
    }
}
exports.default = CutiService;
//# sourceMappingURL=cuti.service.js.map