import LogAktivitasHarianRepository from './log-aktivitas-harian.repository';
import { ActivityLibraryRepository } from '../activity-library/activity-library.repository';

export default class LogAktivitasHarianService {

    static async createLog(payload: { id_pegawai: string | number, tanggal: string, id_activity_library: string | number, frekuensi: number, catatan?: string }) {
        // Validation logic
        if (!payload.id_pegawai || !payload.id_activity_library || !payload.tanggal) {
            throw new Error('id_pegawai, id_activity_library, and tanggal are required');
        }

        // Get standard duration from Activity Library
        const activity = await ActivityLibraryRepository.findById(String(payload.id_activity_library));
        if (!activity) {
            throw new Error('Activity Library not found');
        }

        const frekuensi = payload.frekuensi || 1;
        // Business Logic: WLA Calculation
        const total_durasi_terhitung = frekuensi * activity.durationMinutes;

        const newLog = await LogAktivitasHarianRepository.create({
            id_pegawai: payload.id_pegawai,
            tanggal: payload.tanggal,
            id_activity_library: payload.id_activity_library,
            frekuensi,
            total_durasi_terhitung,
            catatan: payload.catatan
        });

        return newLog;
    }

    static async createBulkLogs(id_pegawai: string | number, tanggal: string, logsData: { id_activity_library: string | number, frekuensi: number, catatan?: string, lampiran?: string }[]) {
        if (!id_pegawai || !tanggal || !logsData || logsData.length === 0) {
            throw new Error('id_pegawai, tanggal, and logs data are required');
        }

        // Fetch all activities standard to calculate duration
        const allActivities = await ActivityLibraryRepository.findAll({});

        const validLogs: any[] = [];

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
            return await LogAktivitasHarianRepository.createBulk(id_pegawai, tanggal, validLogs);
        }

        // Even if length is 0, we should still clear existing logs
        return await LogAktivitasHarianRepository.createBulk(id_pegawai, tanggal, []);
    }

    static async getMyLogs(id_pegawai: string | number, startDate: string, endDate?: string) {
        if (!endDate) endDate = startDate; // Fallback for backward compatibility
        return LogAktivitasHarianRepository.getByPegawaiAndDateRange(id_pegawai, startDate, endDate);
    }

    static async getSummary(id_pegawai: string | number, startDate: string, endDate: string) {
        return LogAktivitasHarianRepository.getSummaryByPegawai(id_pegawai, startDate, endDate);
    }

    static async getAdminSummaryByDateRange(startDate: string, endDate: string, supervisorId?: string) {
        return LogAktivitasHarianRepository.getAllByDateRange(startDate, endDate, supervisorId);
    }

    static async updateStatus(id_log: number, status: 'approved' | 'rejected') {
        return LogAktivitasHarianRepository.updateStatus(id_log, status);
    }
}
