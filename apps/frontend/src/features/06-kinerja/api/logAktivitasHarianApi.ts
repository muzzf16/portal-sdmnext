import api from '../../../shared/services/api';

export interface LogAktivitasWlaPayload {
    id_pegawai?: number;
    id_activity_library: number;
    tanggal: string;
    frekuensi: number;
    catatan?: string;
}

export const createLogAktivitasWla = (data: LogAktivitasWlaPayload) =>
    api.post('/log-aktivitas-harian', data);

export const createBulkLogAktivitasWla = (data: { id_pegawai?: string | number, tanggal: string, logs: Omit<LogAktivitasWlaPayload, 'tanggal' | 'id_pegawai'>[] }) =>
    api.post('/log-aktivitas-harian/bulk', data);

export const getMyLogAktivitasWla = (tanggal: string, id_pegawai?: number) =>
    api.get('/log-aktivitas-harian/my-logs', { params: { tanggal, id_pegawai } });

export const getLogAktivitasSummaryWla = (startDate: string, endDate: string, id_pegawai?: number) =>
    api.get('/log-aktivitas-harian/summary', { params: { startDate, endDate, id_pegawai } });

export const getAdminLogAktivitasSummaryWla = (tanggal: string) =>
    api.get('/log-aktivitas-harian/admin/summary', { params: { tanggal } });

export const updateLogAktivitasStatusWla = (id: number | string, status: 'approved' | 'rejected') =>
    api.put(`/log-aktivitas-harian/${id}/status`, { status });
