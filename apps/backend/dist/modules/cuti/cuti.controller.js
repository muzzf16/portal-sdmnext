"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cuti_service_1 = __importDefault(require("./cuti.service"));
class CutiController {
    static async getAllPermintaanCuti(req, res, next) {
        try {
            const leaveRequests = await cuti_service_1.default.getAllPermintaanCuti();
            res.status(200).json(leaveRequests);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPermintaanCutiById(req, res, next) {
        try {
            const { id } = req.params;
            const leaveRequest = await cuti_service_1.default.getPermintaanCutiById(id);
            res.status(200).json(leaveRequest);
        }
        catch (error) {
            next(error);
        }
    }
    static async submitPermintaanCuti(req, res, next) {
        try {
            const leaveRequestData = req.body;
            const newLeaveRequest = await cuti_service_1.default.submitPermintaanCuti(leaveRequestData);
            res.status(201).json(newLeaveRequest);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatusCuti(req, res, next) {
        try {
            const { id } = req.params;
            const { status, rejectionReason } = req.body;
            const result = await cuti_service_1.default.updateStatusCuti(id, status, rejectionReason);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePermintaanCuti(req, res, next) {
        try {
            const { id } = req.params;
            const result = await cuti_service_1.default.deletePermintaanCuti(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = CutiController;
//# sourceMappingURL=cuti.controller.js.map