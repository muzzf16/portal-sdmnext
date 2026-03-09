export default class LogAktivitasHarianRepository {
    static create(payload: {
        id_pegawai: string | number;
        tanggal: string;
        id_activity_library: string | number;
        frekuensi: number;
        total_durasi_terhitung: number;
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
    static createBulk(id_pegawai: string | number, tanggal: string, logs: {
        id_pegawai: string | number;
        tanggal: string;
        id_activity_library: string | number;
        frekuensi: number;
        total_durasi_terhitung: number;
        catatan?: string;
        lampiran?: string;
    }[]): Promise<{
        message: string;
        changes: number | undefined;
    }>;
    static getByPegawaiAndDate(id_pegawai: string | number, tanggal: string): Promise<any[]>;
    static getSummaryByPegawai(id_pegawai: string | number, startDate: string, endDate: string): Promise<any>;
    static getAllByDate(tanggal: string, supervisorId?: string): Promise<any[]>;
    static updateStatus(id_log: number, status: 'approved' | 'rejected'): Promise<{
        id_log: number;
        status_approval: "approved" | "rejected";
    }>;
}
//# sourceMappingURL=log-aktivitas-harian.repository.d.ts.map