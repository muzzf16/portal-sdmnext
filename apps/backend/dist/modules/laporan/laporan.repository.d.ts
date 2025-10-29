export declare const LaporanRepository: {
    generateLaporanPegawai(): Promise<any[]>;
    generateLaporanAbsensi(startDate: string, endDate: string): Promise<any[]>;
    generateLaporanPenggajian(month: string, year: string): Promise<any[]>;
    generateLaporanCuti(month: string, year: string): Promise<any[]>;
    generateLaporanKinerja(month: string, year: string): Promise<any[]>;
    generateLaporanTurnover(startDate: string, endDate: string): Promise<{
        period: {
            startDate: string;
            endDate: string;
        };
        turnoverCount: number;
        turnoverRate: number;
        turnoverDetails: any[];
    }>;
    generateLaporanDemografi(): Promise<{
        genderDistribution: any[];
        departmentDistribution: any[];
        tenureDistribution: any[];
    }>;
    generateLaporanPegawaiKomprehensif(): Promise<{
        employees: any[];
        summary: any;
    }>;
    generateLaporanAbsensiAnalitik(startDate: string, endDate: string): Promise<{
        attendance: any[];
        punctualityStats: any;
    }>;
    generateLaporanPenggajianAnalitik(month: string, year: string): Promise<{
        payrolls: any[];
        stats: any;
    }>;
};
//# sourceMappingURL=laporan.repository.d.ts.map