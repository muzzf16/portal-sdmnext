declare class LaporanService {
    static generateLaporanPegawai(): Promise<any[]>;
    static generateLaporanAbsensi(startDate: string, endDate: string): Promise<any[]>;
    static generateLaporanPenggajian(month: string, year: string): Promise<any[]>;
    static generateLaporanCuti(month: string, year: string): Promise<any[]>;
    static generateLaporanKinerja(month: string, year: string): Promise<any[]>;
    static generateLaporanTurnover(startDate: string, endDate: string): Promise<{
        period: {
            startDate: string;
            endDate: string;
        };
        turnoverCount: number;
        turnoverRate: number;
        turnoverDetails: any[];
    }>;
    static generateLaporanDemografi(): Promise<{
        genderDistribution: any[];
        departmentDistribution: any[];
        tenureDistribution: any[];
    }>;
    static generateLaporanPegawaiKomprehensif(): Promise<{
        employees: any[];
        summary: any;
    }>;
    static generateLaporanAbsensiAnalitik(startDate: string, endDate: string): Promise<{
        attendance: any[];
        punctualityStats: any;
    }>;
    static generateLaporanPenggajianAnalitik(month: string, year: string): Promise<{
        payrolls: any[];
        stats: any;
    }>;
    static formatForExport(data: any[], reportType: string): any[];
}
export default LaporanService;
//# sourceMappingURL=laporan.service.d.ts.map