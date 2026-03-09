"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_aktivitas_harian_repository_1 = __importDefault(require("./log-aktivitas-harian.repository"));
const activity_library_repository_1 = require("../activity-library/activity-library.repository");
class LogAktivitasHarianService {
    static async createLog(payload) {
        if (!payload.id_pegawai || !payload.id_activity_library || !payload.tanggal) {
            throw new Error('id_pegawai, id_activity_library, and tanggal are required');
        }
        const activity = await activity_library_repository_1.ActivityLibraryRepository.findById(String(payload.id_activity_library));
        if (!activity) {
            throw new Error('Activity Library not found');
        }
        const frekuensi = payload.frekuensi || 1;
        const total_durasi_terhitung = frekuensi * activity.durationMinutes;
        const newLog = await log_aktivitas_harian_repository_1.default.create({
            id_pegawai: payload.id_pegawai,
            tanggal: payload.tanggal,
            id_activity_library: payload.id_activity_library,
            frekuensi,
            total_durasi_terhitung,
            catatan: payload.catatan
        });
        return newLog;
    }
    static async createBulkLogs(id_pegawai, tanggal, logsData) {
        if (!id_pegawai || !tanggal || !logsData || logsData.length === 0) {
            throw new Error('id_pegawai, tanggal, and logs data are required');
        }
        const allActivities = await activity_library_repository_1.ActivityLibraryRepository.findAll({});
        const validLogs = [];
        for (const log of logsData) {
            if (log.frekuensi > 0) {
                const activity = allActivities.find(a => String(a.id) === String(log.id_activity_library));
                if (activity) {
                    const total_durasi_terhitung = log.frekuensi * activity.durationMinutes;
                    validLogs.push({
                        id_pegawai,
                        tanggal,
                        id_activity_library: log.id_activity_library,
                        frekuensi: log.frekuensi,
                        total_durasi_terhitung,
                        catatan: log.catatan,
                        lampiran: log.lampiran
                    });
                }
            }
        }
        if (validLogs.length > 0) {
            return await log_aktivitas_harian_repository_1.default.createBulk(id_pegawai, tanggal, validLogs);
        }
        return await log_aktivitas_harian_repository_1.default.createBulk(id_pegawai, tanggal, []);
    }
    static async getMyLogs(id_pegawai, tanggal) {
        return log_aktivitas_harian_repository_1.default.getByPegawaiAndDate(id_pegawai, tanggal);
    }
    static async getSummary(id_pegawai, startDate, endDate) {
        return log_aktivitas_harian_repository_1.default.getSummaryByPegawai(id_pegawai, startDate, endDate);
    }
    static async getAdminSummaryByDate(tanggal, supervisorId) {
        return log_aktivitas_harian_repository_1.default.getAllByDate(tanggal, supervisorId);
    }
    static async updateStatus(id_log, status) {
        return log_aktivitas_harian_repository_1.default.updateStatus(id_log, status);
    }
}
exports.default = LogAktivitasHarianService;
//# sourceMappingURL=log-aktivitas-harian.service.js.map