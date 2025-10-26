"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const laporan_repository_1 = require("./laporan.repository");
const errors_1 = require("../../utils/errors");
class LaporanService {
    static async generateLaporanPegawai() {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanPegawai();
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating employee report: ${error.message}`, 500);
        }
    }
    static async generateLaporanAbsensi(startDate, endDate) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanAbsensi(startDate, endDate);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating attendance report: ${error.message}`, 500);
        }
    }
    static async generateLaporanPenggajian(month, year) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanPenggajian(month, year);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating payroll report: ${error.message}`, 500);
        }
    }
    static async generateLaporanCuti(month, year) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanCuti(month, year);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating leave report: ${error.message}`, 500);
        }
    }
    static async generateLaporanKinerja(month, year) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanKinerja(month, year);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating performance report: ${error.message}`, 500);
        }
    }
}
exports.default = LaporanService;
//# sourceMappingURL=laporan.service.js.map