export declare const PelatihanRepository: {
    findByEmployeeId(employeeId: string): Promise<any[]>;
    create(employeeId: string, data: {
        nama_pelatihan: string;
        penyelenggara: string;
        tanggal_mulai: string;
        tanggal_selesai: string;
        nomor_sertifikat: string;
    }): Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=pelatihan.repository.d.ts.map