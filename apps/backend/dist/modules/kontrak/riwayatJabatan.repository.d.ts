export declare const RiwayatJabatanRepository: {
    findByEmployeeId(employeeId: string): Promise<any[]>;
    create(employeeId: string, data: {
        jabatan_lama: string;
        jabatan_baru: string;
        tanggal_perubahan: string;
    }): Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=riwayatJabatan.repository.d.ts.map