export default class LogAktivitasHarianService {
    static createLog(payload: {
        id_pegawai: string | number;
        tanggal: string;
        id_activity_library: string | number;
        frekuensi: number;
        catatan?: string;
    }): Promise<{
        id_pegawai: string | number;
        tanggal: string;
        id_activity_library: string | number;
        frekuensi: number;
        total_durasi_terhitung: number;
        catatan?: string;
        id_log: number | undefined;
    }>;
    static createBulkLogs(id_pegawai: string | number, tanggal: string, logsData: {
        id_activity_library: string | number;
        frekuensi: number;
        catatan?: string;
        lampiran?: string;
    }[]): Promise<{
        message: string;
        changes: number | undefined;
    }>;
    static getMyLogs(id_pegawai: string | number, tanggal: string): Promise<any[]>;
    static getSummary(id_pegawai: string | number, startDate: string, endDate: string): Promise<any>;
    static getAdminSummaryByDate(tanggal: string, supervisorId?: string): Promise<any[]>;
    static updateStatus(id_log: number, status: 'approved' | 'rejected'): Promise<{
        id_log: number;
        status_approval: "approved" | "rejected";
    }>;
}
//# sourceMappingURL=log-aktivitas-harian.service.d.ts.map