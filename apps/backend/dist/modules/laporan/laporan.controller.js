"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const laporan_service_1 = __importDefault(require("./laporan.service"));
class LaporanController {
    static async getLaporanPegawai(req, res, next) {
        try {
            const report = await laporan_service_1.default.generateLaporanPegawai();
            res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getLaporanAbsensi(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const report = await laporan_service_1.default.generateLaporanAbsensi(startDate, endDate);
            res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getLaporanPenggajian(req, res, next) {
        try {
            const { month, year } = req.query;
            const report = await laporan_service_1.default.generateLaporanPenggajian(month, year);
            res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getLaporanCuti(req, res, next) {
        try {
            const { month, year } = req.query;
            const report = await laporan_service_1.default.generateLaporanCuti(month, year);
            res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getLaporanKinerja(req, res, next) {
        try {
            const { month, year } = req.query;
            const report = await laporan_service_1.default.generateLaporanKinerja(month, year);
            res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = LaporanController;
//# sourceMappingURL=laporan.controller.js.map