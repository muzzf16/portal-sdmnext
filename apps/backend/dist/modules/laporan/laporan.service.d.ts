declare class LaporanService {
    static generateLaporanPegawai(): Promise<any[]>;
    static generateLaporanAbsensi(startDate: string, endDate: string): Promise<any[]>;
    static generateLaporanPenggajian(month: string, year: string): Promise<any[]>;
    static generateLaporanCuti(month: string, year: string): Promise<any[]>;
    static generateLaporanKinerja(month: string, year: string): Promise<any[]>;
}
export default LaporanService;
//# sourceMappingURL=laporan.service.d.ts.map