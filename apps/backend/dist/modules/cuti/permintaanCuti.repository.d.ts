export declare const PermintaanCutiRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmployeeId(employeeId: string): Promise<any[]>;
    create(data: any): Promise<any>;
    updateStatus(id: string, status: string, rejectionReason?: string | null): Promise<{
        message: string;
    }>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=permintaanCuti.repository.d.ts.map