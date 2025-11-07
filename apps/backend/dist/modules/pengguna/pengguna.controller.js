"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pengguna_service_1 = __importDefault(require("./pengguna.service"));
class PenggunaController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { accessToken, user } = await pengguna_service_1.default.login(email, password);
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
            const { name, email, password } = req.body;
            const result = await pengguna_service_1.default.register(name, email, password);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllPengguna(req, res, next) {
        try {
            const users = await pengguna_service_1.default.getAllPengguna();
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPenggunaById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await pengguna_service_1.default.getPenggunaById(id);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePengguna(req, res, next) {
        try {
            const { id } = req.params;
            const updatedUser = await pengguna_service_1.default.updatePengguna(id, req.body);
            res.status(200).json(updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePengguna(req, res, next) {
        try {
            const { id } = req.params;
            const result = await pengguna_service_1.default.deletePengguna(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PenggunaController;
//# sourceMappingURL=pengguna.controller.js.map