"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const penggajian_service_1 = __importDefault(require("./penggajian.service"));
class PenggajianController {
    static async getAllPenggajian(req, res, next) {
        try {
            const payrolls = await penggajian_service_1.default.getAllPenggajian();
            res.status(200).json(payrolls);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPenggajianById(req, res, next) {
        try {
            const { id } = req.params;
            const payroll = await penggajian_service_1.default.getPenggajianById(id);
            res.status(200).json(payroll);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPenggajianByEmployeeId(req, res, next) {
        try {
            const { id } = req.params;
            const payrolls = await penggajian_service_1.default.getPenggajianByEmployeeId(id);
            res.status(200).json(payrolls);
        }
        catch (error) {
            next(error);
        }
    }
    static async createPenggajian(req, res, next) {
        try {
            const payrollData = req.body;
            const newPayroll = await penggajian_service_1.default.createPenggajian(payrollData);
            res.status(201).json(newPayroll);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePenggajian(req, res, next) {
        try {
            const { id } = req.params;
            const payrollData = req.body;
            const updatedPayroll = await penggajian_service_1.default.updatePenggajian(id, payrollData);
            res.status(200).json(updatedPayroll);
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePenggajian(req, res, next) {
        try {
            const { id } = req.params;
            const result = await penggajian_service_1.default.deletePenggajian(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async addSalaryComponent(req, res, next) {
        try {
            const { id } = req.params;
            const componentData = req.body;
            const updatedPayroll = await penggajian_service_1.default.addSalaryComponent(id, componentData);
            res.status(200).json(updatedPayroll);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PenggajianController;
//# sourceMappingURL=penggajian.controller.js.map