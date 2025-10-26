"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kontrak_repository_1 = require("./kontrak.repository");
const riwayatJabatan_repository_1 = require("./riwayatJabatan.repository");
const errors_1 = require("../../utils/errors");
const db_1 = require("../../config/db");
class KontrakService {
    static async getAllContracts() {
        try {
            return await kontrak_repository_1.KontrakRepository.findAll();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving contracts: ${error.message}`, 500);
        }
    }
    static async getContractById(id) {
        try {
            const contract = await kontrak_repository_1.KontrakRepository.findById(id);
            if (!contract) {
                throw new errors_1.AppError('Contract not found', 404);
            }
            return contract;
        }
        catch (error) {
            if (error.statusCode === 404)
                throw error;
            throw new errors_1.AppError(`Error retrieving contract: ${error.message}`, 500);
        }
    }
    static async getContractsByEmployeeId(employeeId) {
        try {
            return await kontrak_repository_1.KontrakRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving contracts for employee: ${error.message}`, 500);
        }
    }
    static async createContract(contractData) {
        try {
            return await kontrak_repository_1.KontrakRepository.create(contractData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating contract: ${error.message}`, 500);
        }
    }
    static async updateContract(id, contractData) {
        try {
            const existingContract = await kontrak_repository_1.KontrakRepository.findById(id);
            if (!existingContract) {
                throw new errors_1.AppError('Contract not found', 404);
            }
            return await kontrak_repository_1.KontrakRepository.update(id, contractData);
        }
        catch (error) {
            if (error.statusCode === 404)
                throw error;
            throw new errors_1.AppError(`Error updating contract: ${error.message}`, 500);
        }
    }
    static async deleteContract(id) {
        try {
            const existingContract = await kontrak_repository_1.KontrakRepository.findById(id);
            if (!existingContract) {
                throw new errors_1.AppError('Contract not found', 404);
            }
            return await kontrak_repository_1.KontrakRepository.delete(id);
        }
        catch (error) {
            if (error.statusCode === 404)
                throw error;
            throw new errors_1.AppError(`Error deleting contract: ${error.message}`, 500);
        }
    }
    static async getExpiringContracts(days = 30) {
        try {
            const db = await (0, db_1.openDb)();
            const query = `
        SELECT * FROM kontrak 
        WHERE status = 'active' 
        AND endDate BETWEEN date('now') AND date('now', '+${days} days')
        ORDER BY endDate ASC
      `;
            const rows = await db.all(query);
            return rows;
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving expiring contracts: ${error.message}`, 500);
        }
    }
    static async getRiwayatJabatan(employeeId) {
        try {
            return await riwayatJabatan_repository_1.RiwayatJabatanRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving job history: ${error.message}`, 500);
        }
    }
    static async addRiwayatJabatan(employeeId, riwayatJabatanData) {
        try {
            return await riwayatJabatan_repository_1.RiwayatJabatanRepository.create(employeeId, riwayatJabatanData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error adding job history: ${error.message}`, 500);
        }
    }
}
exports.default = KontrakService;
//# sourceMappingURL=kontrak.service.js.map