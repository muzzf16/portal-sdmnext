"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kontrak_service_1 = __importDefault(require("./kontrak.service"));
class KontrakController {
    static async getAllContracts(req, res, next) {
        try {
            const contracts = await kontrak_service_1.default.getAllContracts();
            res.status(200).json({
                success: true,
                data: contracts
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getContractById(req, res, next) {
        try {
            const { id } = req.params;
            const contract = await kontrak_service_1.default.getContractById(id);
            res.status(200).json({
                success: true,
                data: contract
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getContractsByEmployeeId(req, res, next) {
        try {
            const { employeeId } = req.params;
            const contracts = await kontrak_service_1.default.getContractsByEmployeeId(employeeId);
            res.status(200).json({
                success: true,
                data: contracts
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createContract(req, res, next) {
        try {
            const contractData = req.body;
            const newContract = await kontrak_service_1.default.createContract(contractData);
            res.status(201).json({
                success: true,
                data: newContract
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateContract(req, res, next) {
        try {
            const { id } = req.params;
            const contractData = req.body;
            const updatedContract = await kontrak_service_1.default.updateContract(id, contractData);
            res.status(200).json({
                success: true,
                data: updatedContract
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteContract(req, res, next) {
        try {
            const { id } = req.params;
            await kontrak_service_1.default.deleteContract(id);
            res.status(200).json({
                success: true,
                message: 'Contract deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getExpiringContracts(req, res, next) {
        try {
            const days = parseInt(req.query.days) || 30;
            const contracts = await kontrak_service_1.default.getExpiringContracts(days);
            res.status(200).json({
                success: true,
                data: contracts
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRiwayatJabatan(req, res, next) {
        try {
            const { id } = req.params;
            const riwayatJabatan = await kontrak_service_1.default.getRiwayatJabatan(id);
            res.status(200).json({
                success: true,
                data: riwayatJabatan
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async addRiwayatJabatan(req, res, next) {
        try {
            const { id } = req.params;
            const riwayatJabatanData = req.body;
            const result = await kontrak_service_1.default.addRiwayatJabatan(id, riwayatJabatanData);
            res.status(201).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = KontrakController;
//# sourceMappingURL=kontrak.controller.js.map