"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_repository_1 = require("./pegawai.repository");
const pengguna_repository_1 = require("../pengguna/pengguna.repository");
const errors_1 = require("../../utils/errors");
class PegawaiAuthService {
    static async createEmployeeWithUser(pegawaiData, photo) {
        try {
            const employee = await pegawai_repository_1.PegawaiRepository.create(pegawaiData);
            const userData = {
                name: pegawaiData.name,
                email: pegawaiData.email,
                password: 'password123',
                role: 'employee',
                employeeId: employee.id
            };
            const user = await pengguna_repository_1.PenggunaRepository.create(userData);
            return { employee, user };
        }
        catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                if (error.message.includes('pegawai.nip')) {
                    await pegawai_repository_1.PegawaiRepository.delete(pegawaiData.id || `emp-${Date.now()}`);
                }
                throw new errors_1.AppError(`Data already exists: ${error.message}`, 400);
            }
            throw new errors_1.AppError(`Error creating employee and user: ${error.message}`, 500);
        }
    }
}
exports.default = PegawaiAuthService;
//# sourceMappingURL=pegawai.auth.service.js.map