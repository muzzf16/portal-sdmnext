"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permintaanPerubahanData_service_1 = __importDefault(require("./permintaanPerubahanData.service"));
class PermintaanPerubahanDataController {
    static async getAllPermintaanPerubahanData(req, res, next) {
        try {
            const requests = await permintaanPerubahanData_service_1.default.getAllPermintaanPerubahanData();
            res.status(200).json(requests);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPermintaanPerubahanDataById(req, res, next) {
        try {
            const { id } = req.params;
            const request = await permintaanPerubahanData_service_1.default.getPermintaanPerubahanDataById(id);
            res.status(200).json(request);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPermintaanPerubahanDataByEmployeeId(req, res, next) {
        try {
            const { id } = req.params;
            const requests = await permintaanPerubahanData_service_1.default.getPermintaanPerubahanDataByEmployeeId(id);
            res.status(200).json(requests);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPendingPermintaanPerubahanData(req, res, next) {
        try {
            const requests = await permintaanPerubahanData_service_1.default.getPendingPermintaanPerubahanData();
            res.status(200).json(requests);
        }
        catch (error) {
            next(error);
        }
    }
    static async createPermintaanPerubahanData(req, res, next) {
        try {
            const requestData = req.body;
            const newRequest = await permintaanPerubahanData_service_1.default.createPermintaanPerubahanData(requestData);
            res.status(201).json(newRequest);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePermintaanPerubahanDataStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await permintaanPerubahanData_service_1.default.updatePermintaanPerubahanDataStatus(id, status);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePermintaanPerubahanData(req, res, next) {
        try {
            const { id } = req.params;
            const result = await permintaanPerubahanData_service_1.default.deletePermintaanPerubahanData(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PermintaanPerubahanDataController;
//# sourceMappingURL=permintaanPerubahanData.controller.js.map