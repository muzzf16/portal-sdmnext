"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pengguna_repository_1 = require("./pengguna.repository");
const errors_1 = require("../../utils/errors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config/config"));
class PenggunaService {
    static async login(email, password) {
        try {
            const user = await pengguna_repository_1.PenggunaRepository.authenticate(email, password);
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.default.jwtSecret, { expiresIn: '24h' });
            return { accessToken: token, user };
        }
        catch (error) {
            throw new errors_1.AppError(`Authentication failed: ${error.message}`, 401);
        }
    }
    static async register(name, email, password) {
        try {
            const newUser = await pengguna_repository_1.PenggunaRepository.create({ name, email, password, role: 'EMPLOYEE' });
            return newUser;
        }
        catch (error) {
            if (error.message === 'Email already exists') {
                throw new errors_1.AppError('Email already exists', 400);
            }
            throw new errors_1.AppError(`Error registering user: ${error.message}`, 500);
        }
    }
    static async getAllPengguna() {
        try {
            return await pengguna_repository_1.PenggunaRepository.findAll();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving users: ${error.message}`, 500);
        }
    }
    static async getPenggunaById(id) {
        try {
            const user = await pengguna_repository_1.PenggunaRepository.findById(id);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            return user;
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving user: ${error.message}`, 500);
        }
    }
    static async updatePengguna(id, data) {
        try {
            const updatedUser = await pengguna_repository_1.PenggunaRepository.update(id, data);
            return updatedUser;
        }
        catch (error) {
            throw new errors_1.AppError(`Error updating user: ${error.message}`, 500);
        }
    }
    static async deletePengguna(id) {
        try {
            const deleted = await pengguna_repository_1.PenggunaRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('User not found', 404);
            }
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            throw new errors_1.AppError(`Error deleting user: ${error.message}`, 500);
        }
    }
}
exports.default = PenggunaService;
//# sourceMappingURL=pengguna.service.js.map