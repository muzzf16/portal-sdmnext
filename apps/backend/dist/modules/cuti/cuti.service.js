"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permintaanCuti_repository_1 = require("./permintaanCuti.repository");
const errors_1 = require("../../utils/errors");
class CutiService {
    static async getAllPermintaanCuti() {
        try {
            return await permintaanCuti_repository_1.PermintaanCutiRepository.findAll();
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
}
exports.default = CutiService;
//# sourceMappingURL=cuti.service.js.map