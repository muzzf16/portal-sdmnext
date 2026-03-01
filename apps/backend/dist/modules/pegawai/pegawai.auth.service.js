"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_repository_1 = require("./pegawai.repository");
const pengguna_repository_1 = require("../pengguna/pengguna.repository");
const errors_1 = require("../../utils/errors");
const pegawai_service_1 = __importDefault(require("./pegawai.service"));
class PegawaiAuthService {
    static async createEmployeeWithUser(pegawaiData) {
        let employee;
        try {
            const { name, email, ...restData } = pegawaiData;
            employee = await pegawai_service_1.default.createPegawai(name, email, restData);
            const userData = {
                name: pegawaiData.name,
                email: pegawaiData.email,
                password: 'password123',
                role: 'employee',
                employeeId: employee.id
            };
            try {
                const user = await pengguna_repository_1.PenggunaRepository.create(userData);
                return { employee, user };
            }
            catch (userCreateErr) {
                await pegawai_repository_1.PegawaiRepository.delete(employee.id);
                throw userCreateErr;
            }
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            if (error.message.includes('UNIQUE constraint failed') || error.message.includes('Email already exists')) {
                throw new errors_1.AppError(`Data already exists: ${error.message}`, 400);
            }
            throw new errors_1.AppError(`Error creating employee and user: ${error.message}`, 500);
        }
    }
}
exports.default = PegawaiAuthService;
//# sourceMappingURL=pegawai.auth.service.js.map