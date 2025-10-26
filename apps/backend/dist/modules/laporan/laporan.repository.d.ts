export declare const LaporanRepository: {
    generateLaporanPegawai(): Promise<any[]>;
    generateLaporanAbsensi(startDate: string, endDate: string): Promise<any[]>;
    generateLaporanPenggajian(month: string, year: string): Promise<any[]>;
    generateLaporanCuti(month: string, year: string): Promise<any[]>;
    generateLaporanKinerja(month: string, year: string): Promise<any[]>;
};
//# sourceMappingURL=laporan.repository.d.ts.map