import api from '../../../shared/services/api';

export interface LogAktivitasWlaPayload {
    id_pegawai?: number;
    id_activity_library: string | number;
    tanggal: string;
    frekuensi: number;
    catatan?: string;
}

export const createLogAktivitasWla = (data: LogAktivitasWlaPayload) =>
    api.post('/log-aktivitas-harian', data);

export const createBulkLogAktivitasWla = (data: { id_pegawai?: string | number, tanggal: string, logs: (Omit<LogAktivitasWlaPayload, 'tanggal' | 'id_pegawai'> & { file?: File | null })[] }) => {
    const formData = new FormData();
    if (data.id_pegawai) {
        formData.append('id_pegawai', String(data.id_pegawai));
    }
    formData.append('tanggal', data.tanggal);

    // We send logs as a JSON string, but without the file objects
    const logsData = data.logs.map(({ file, ...rest }) => rest);
    formData.append('logs', JSON.stringify(logsData));

    // Append files individually with matching fieldnames
    data.logs.forEach(log => {
        if (log.file) {
            formData.append(`file_${log.id_activity_library}`, log.file);
        }
    });

    return api.post('/log-aktivitas-harian/bulk', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getMyLogAktivitasWla = (tanggal: string, id_pegawai?: number) =>
    api.get('/log-aktivitas-harian/my-logs', { params: { tanggal, id_pegawai } });

export const getLogAktivitasSummaryWla = (startDate: string, endDate: string, id_pegawai?: number) =>
    api.get('/log-aktivitas-harian/summary', { params: { startDate, endDate, id_pegawai } });

export const getAdminLogAktivitasSummaryWla = (tanggal: string) =>
    api.get('/log-aktivitas-harian/admin/summary', { params: { tanggal } });

export const getAdminDetailLogsWla = (tanggal: string, id_pegawai: string) =>
    api.get('/log-aktivitas-harian/admin/logs', { params: { tanggal, id_pegawai } });

export const updateLogAktivitasStatusWla = (id: number | string, status: 'approved' | 'rejected') =>
    api.put(`/log-aktivitas-harian/${id}/status`, { status });
