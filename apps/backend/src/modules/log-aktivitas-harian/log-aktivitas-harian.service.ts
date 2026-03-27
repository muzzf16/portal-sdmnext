import { AppError } from '../../utils/errors';
import { ActivityLibraryRepository } from '../activity-library/activity-library.repository';
import LogAktivitasHarianRepository from './log-aktivitas-harian.repository';
import {
    AdminWlaSummaryRow,
    CreateBulkLogAktivitasPayload,
    CreateLogAktivitasPayload,
    LogAktivitasHarianItem,
    LogAktivitasSummary,
    LogApprovalStatus,
} from './log-aktivitas-harian.types';

export default class LogAktivitasHarianService {
    private static normalizeText(value: unknown) {
        return String(value ?? '').trim();
    }

    private static normalizeNumber(value: unknown, fieldName: string) {
        const number = Number(value ?? 0);
        if (!Number.isFinite(number) || number < 0) {
            throw new AppError(`${fieldName} harus berupa angka 0 atau lebih`, 400);
        }
        return number;
    }

    private static validateDate(value: string, fieldName: string) {
        if (!value) {
            throw new AppError(`${fieldName} is required`, 400);
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new AppError(`${fieldName} tidak valid`, 400);
        }

        return value;
    }

    private static async buildPersistedLog(
        payload: CreateLogAktivitasPayload
    ): Promise<CreateLogAktivitasPayload & { total_durasi_terhitung: number }> {
        const normalizedPayload: CreateLogAktivitasPayload = {
            id_pegawai: this.normalizeText(payload.id_pegawai),
            tanggal: this.validateDate(this.normalizeText(payload.tanggal), 'tanggal'),
            id_activity_library: this.normalizeText(payload.id_activity_library),
            frekuensi: this.normalizeNumber(payload.frekuensi || 1, 'frekuensi'),
            catatan: this.normalizeText(payload.catatan),
            lampiran: this.normalizeText(payload.lampiran),
        };

        if (!normalizedPayload.id_pegawai || !normalizedPayload.id_activity_library) {
            throw new AppError('id_pegawai, id_activity_library, and tanggal are required', 400);
        }

        const activity = await ActivityLibraryRepository.findById(String(normalizedPayload.id_activity_library));
        if (!activity) {
            throw new AppError('Activity Library not found', 404);
        }

        return {
            ...normalizedPayload,
            total_durasi_terhitung: normalizedPayload.frekuensi * activity.durationMinutes,
        };
    }

    static async createLog(payload: CreateLogAktivitasPayload) {
        const persistedLog = await this.buildPersistedLog(payload);
        return LogAktivitasHarianRepository.create(persistedLog);
    }

    static async createBulkLogs(payload: CreateBulkLogAktivitasPayload) {
        const employeeId = this.normalizeText(payload.id_pegawai);
        const tanggal = this.validateDate(this.normalizeText(payload.tanggal), 'tanggal');
        const logsData = Array.isArray(payload.logs) ? payload.logs : [];

        if (!employeeId || logsData.length === 0) {
            throw new AppError('id_pegawai, tanggal, and logs data are required', 400);
        }

        const validLogs: Array<CreateLogAktivitasPayload & { total_durasi_terhitung: number }> = [];

        for (const log of logsData) {
            const frekuensi = this.normalizeNumber(log.frekuensi || 0, 'frekuensi');
            if (frekuensi <= 0) {
                continue;
            }

            const persistedLog = await this.buildPersistedLog({
                ...log,
                id_pegawai: employeeId,
                tanggal,
                frekuensi,
            });
            validLogs.push(persistedLog);
        }

        return LogAktivitasHarianRepository.createBulk(employeeId, tanggal, validLogs);
    }

    static async getMyLogs(id_pegawai: string | number, startDate: string, endDate?: string): Promise<LogAktivitasHarianItem[]> {
        const employeeId = this.normalizeText(id_pegawai);
        const normalizedStartDate = this.validateDate(this.normalizeText(startDate), 'startDate');
        const normalizedEndDate = this.validateDate(this.normalizeText(endDate || startDate), 'endDate');

        if (!employeeId) {
            throw new AppError('id_pegawai is required', 400);
        }

        return LogAktivitasHarianRepository.getByPegawaiAndDateRange(employeeId, normalizedStartDate, normalizedEndDate);
    }

    static async getSummary(id_pegawai: string | number, startDate: string, endDate: string): Promise<LogAktivitasSummary> {
        const employeeId = this.normalizeText(id_pegawai);
        const normalizedStartDate = this.validateDate(this.normalizeText(startDate), 'startDate');
        const normalizedEndDate = this.validateDate(this.normalizeText(endDate), 'endDate');

        if (!employeeId) {
            throw new AppError('id_pegawai is required', 400);
        }

        return LogAktivitasHarianRepository.getSummaryByPegawai(employeeId, normalizedStartDate, normalizedEndDate);
    }

    static async getAdminSummaryByDateRange(startDate: string, endDate: string, supervisorId?: string): Promise<AdminWlaSummaryRow[]> {
        const normalizedStartDate = this.validateDate(this.normalizeText(startDate), 'startDate');
        const normalizedEndDate = this.validateDate(this.normalizeText(endDate), 'endDate');
        const normalizedSupervisorId = this.normalizeText(supervisorId);

        return LogAktivitasHarianRepository.getAllByDateRange(
            normalizedStartDate,
            normalizedEndDate,
            normalizedSupervisorId || undefined
        );
    }

    static async updateStatus(id_log: number, status: Extract<LogApprovalStatus, 'approved' | 'rejected'>) {
        const normalizedId = this.normalizeNumber(id_log, 'id_log');
        if (!['approved', 'rejected'].includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        return LogAktivitasHarianRepository.updateStatus(normalizedId, status);
    }
}
