"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_pengguna_service_1 = __importDefault(require("./auth.pengguna.service"));
class AuthPenggunaController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { accessToken, user } = await auth_pengguna_service_1.default.login(email, password);
            res.status(200).json({
                accessToken,
                user
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async register(req, res, next) {
        try {
            const { name, email, password, role } = req.body;
            const result = await auth_pengguna_service_1.default.register(name, email, password, role);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = AuthPenggunaController;
//# sourceMappingURL=auth.pengguna.controller.js.map