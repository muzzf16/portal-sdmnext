export declare const PelatihanRepository: {
    findAll(): Promise<{
        id: any;
        employeeId: any;
        trainingName: any;
        organizer: any;
        startDate: any;
        endDate: any;
        certificate: any;
    }[]>;
    findByEmployeeId(employeeId: string): Promise<{
        id: any;
        employeeId: any;
        trainingName: any;
        organizer: any;
        startDate: any;
        endDate: any;
        certificate: any;
    }[]>;
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