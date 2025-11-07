"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tugasOrientasi_repository_1 = require("./tugasOrientasi.repository");
const errors_1 = require("../../utils/errors");
class OrientasiService {
    static async getTugasOrientasiByEmployeeId(employeeId) {
        try {
            return await tugasOrientasi_repository_1.TugasOrientasiRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving onboarding tasks: ${error.message}`, 500);
        }
    }
    static async createTugasOrientasi(employeeId, taskData) {
        try {
            return await tugasOrientasi_repository_1.TugasOrientasiRepository.create(employeeId, taskData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating onboarding task: ${error.message}`, 500);
        }
    }
    static async updateTugasOrientasi(taskId, taskData) {
        try {
            return await tugasOrientasi_repository_1.TugasOrientasiRepository.update(taskId, taskData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error updating onboarding task: ${error.message}`, 500);
        }
    }
    static async deleteTugasOrientasi(taskId) {
        try {
            const deleted = await tugasOrientasi_repository_1.TugasOrientasiRepository.delete(taskId);
            if (!deleted) {
                throw new errors_1.AppError('Onboarding task not found', 404);
            }
            return { message: 'Onboarding task deleted successfully' };
        }
        catch (error) {
            throw new errors_1.AppError(`Error deleting onboarding task: ${error.message}`, 500);
        }
    }
}
exports.default = OrientasiService;
//# sourceMappingURL=orientasi.service.js.map