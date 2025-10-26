export declare const PegawaiRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<boolean>;
    updatePayrollInfo(id: string, payrollInfo: any): Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=pegawai.repository.d.ts.map