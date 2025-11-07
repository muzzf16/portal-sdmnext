"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pengguna_repository_1 = require("./pengguna.repository");
const errors_1 = require("../../utils/errors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config/config"));
class AuthPenggunaService {
    static async login(email, password) {
        try {
            const user = await pengguna_repository_1.PenggunaRepository.authenticate(email, password);
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role, employeeId: user.employeeId }, config_1.default.jwtSecret, { expiresIn: '24h' });
            return { accessToken: token, user };
        }
        catch (error) {
            if (error.message === 'User not found.' || error.message === 'Invalid credentials.') {
                throw new errors_1.AppError(error.message, 401);
            }
            throw new errors_1.AppError(`Error authenticating user: ${error.message}`, 500);
        }
    }
    static async register(name, email, password, role) {
        try {
            const user = await pengguna_repository_1.PenggunaRepository.create({
                name,
                email,
                password,
                role: role?.toLowerCase() || 'employee'
            });
            return { message: 'Registration successful', userId: user.id };
        }
        catch (error) {
            if (error.message === 'Email already exists') {
                throw new errors_1.AppError('Email already exists', 400);
            }
            throw new errors_1.AppError(`Error registering user: ${error.message}`, 500);
        }
    }
}
exports.default = AuthPenggunaService;
//# sourceMappingURL=auth.pengguna.service.js.map