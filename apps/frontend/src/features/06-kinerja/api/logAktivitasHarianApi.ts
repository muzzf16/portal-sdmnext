import api from '../../../shared/services/api';
import { AdminWlaSummary, LogAktivitasHarian } from '../types';

export interface LogAktivitasWlaPayload {
    id_pegawai?: number;
    id_activity_library: string | number;
    tanggal: string;
    frekuensi: number;
    catatan?: string;
    nominal_rupiah?: number;
}

export const createLogAktivitasWla = (data: LogAktivitasWlaPayload) =>
    api.post('/log-aktivitas-harian', data);

export const createBulkLogAktivitasWla = (data: { id_pegawai?: string | number, tanggal: string, logs: (Omit<LogAktivitasWlaPayload, 'tanggal' | 'id_pegawai'> & { files?: File[] })[] }) => {
    const formData = new FormData();
    if (data.id_pegawai) {
        formData.append('id_pegawai', String(data.id_pegawai));
    }
    formData.append('tanggal', data.tanggal);

    // We send logs as a JSON string, but without the file objects
    const logsData = data.logs.map(({ files, ...rest }) => rest);
    formData.append('logs', JSON.stringify(logsData));

    // Append files individually with indexed fieldnames for multiple files per activity
    data.logs.forEach(log => {
        if (log.files && log.files.length > 0) {
            log.files.forEach((file, idx) => {
                formData.append(`files_${log.id_activity_library}_${idx}`, file);
            });
        }
    });

    return api.post<{ success: boolean; data: { message: string; changes?: number } }>('/log-aktivitas-harian/bulk', formData);
};

export const getMyLogAktivitasWla = (tanggal: string, id_pegawai?: number) =>
    api.get<{ success: boolean; data: LogAktivitasHarian[] }>('/log-aktivitas-harian/my-logs', { params: { tanggal, id_pegawai } });

export const getLogAktivitasSummaryWla = (startDate: string, endDate: string, id_pegawai?: number) =>
    api.get('/log-aktivitas-harian/summary', { params: { startDate, endDate, id_pegawai } });

export const getAdminLogAktivitasSummaryWla = (tanggal?: string, startDate?: string, endDate?: string) =>
    api.get<{ success: boolean; data: AdminWlaSummary[] }>('/log-aktivitas-harian/admin/summary', { params: { tanggal, startDate, endDate } });

export const getAdminDetailLogsWla = (id_pegawai: string, tanggal?: string, startDate?: string, endDate?: string) =>
    api.get<{ success: boolean; data: LogAktivitasHarian[] }>('/log-aktivitas-harian/admin/logs', { params: { tanggal, startDate, endDate, id_pegawai } });

export const updateLogAktivitasStatusWla = (id: number | string, status: 'approved' | 'rejected') =>
    api.put(`/log-aktivitas-harian/${id}/status`, { status });

export const updateLogAktivitasFrekuensiWla = (id: number | string, frekuensi: number) =>
    api.put(`/log-aktivitas-harian/${id}/frekuensi`, { frekuensi });
