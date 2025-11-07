"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_auth_service_1 = __importDefault(require("./pegawai.auth.service"));
class PegawaiAuthController {
    static async createEmployeeWithUser(req, res, next) {
        try {
            const employeeData = { ...req.body };
            const photo = req.file;
            const result = await pegawai_auth_service_1.default.createEmployeeWithUser(employeeData, photo);
            res.status(201).json({
                success: true,
                message: 'Employee and user account created successfully',
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PegawaiAuthController;
//# sourceMappingURL=pegawai.auth.controller.js.map