"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_auth_service_1 = __importDefault(require("./pegawai.auth.service"));
class PegawaiAuthController {
    static async createEmployeeWithUser(req, res, next) {
        try {
            let avatarUrl = req.body.avatarUrl;
            if (req.file) {
                avatarUrl = `/uploads/avatars/${req.file.filename}`;
            }
            const { name, email, ...pegawaiData } = req.body;
            if (pegawaiData.educationHistory && typeof pegawaiData.educationHistory === 'string') {
                try {
                    pegawaiData.educationHistory = JSON.parse(pegawaiData.educationHistory);
                }
                catch (e) {
                    throw new Error('Invalid educationHistory JSON format.');
                }
            }
            const newPegawaiData = {
                ...pegawaiData,
                avatarUrl: avatarUrl || '/avatars/default-avatar.jpg',
                name,
                email
            };
            const result = await pegawai_auth_service_1.default.createEmployeeWithUser(newPegawaiData);
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