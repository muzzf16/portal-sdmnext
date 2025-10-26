"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permintaanPerubahanData_repository_1 = require("./permintaanPerubahanData.repository");
const errors_1 = require("../../utils/errors");
class PermintaanPerubahanDataService {
    static async getAllPermintaanPerubahanData() {
        try {
            return await permintaanPerubahanData_repository_1.PermintaanPerubahanDataRepository.findAll();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving data change requests: ${error.message}`, 500);
        }
    }
    static async getPermintaanPerubahanDataById(id) {
        try {
            const request = await permintaanPerubahanData_repository_1.PermintaanPerubahanDataRepository.findById(id);
            if (!request) {
                throw new errors_1.AppError('Data change request not found', 404);
            }
            return request;
        }
        catch (error) {
            if (error.message === 'Data change request not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error retrieving data change request: ${error.message}`, 500);
        }
    }
    static async getPermintaanPerubahanDataByEmployeeId(employeeId) {
        try {
            return await permintaanPerubahanData_repository_1.PermintaanPerubahanDataRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving data change requests for employee: ${error.message}`, 500);
        }
    }
    static async getPendingPermintaanPerubahanData() {
        try {
            return await permintaanPerubahanData_repository_1.PermintaanPerubahanDataRepository.findPending();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving pending data change requests: ${error.message}`, 500);
        }
    }
    static async createPermintaanPerubahanData(requestData) {
        try {
            return await permintaanPerubahanData_repository_1.PermintaanPerubahanDataRepository.create(requestData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating data change request: ${error.message}`, 500);
        }
    }
    static async updatePermintaanPerubahanDataStatus(id, status) {
        try {
            return await permintaanPerubahanData_repository_1.PermintaanPerubahanDataRepository.updateStatus(id, status);
        }
        catch (error) {
            if (error.message === 'Data change request not found') {
                throw new errors_1.AppError('Data change request not found', 404);
            }
            throw new errors_1.AppError(`Error updating data change request status: ${error.message}`, 500);
        }
    }
    static async deletePermintaanPerubahanData(id) {
        try {
            const deleted = await permintaanPerubahanData_repository_1.PermintaanPerubahanDataRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('Data change request not found', 404);
            }
            return { message: 'Data change request deleted successfully' };
        }
        catch (error) {
            if (error.message === 'Data change request not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error deleting data change request: ${error.message}`, 500);
        }
    }
}
exports.default = PermintaanPerubahanDataService;
//# sourceMappingURL=permintaanPerubahanData.service.js.map