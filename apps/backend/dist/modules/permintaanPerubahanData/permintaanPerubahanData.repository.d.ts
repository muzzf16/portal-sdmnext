export declare const PermintaanPerubahanDataRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmployeeId(employeeId: string): Promise<any[]>;
    findPending(): Promise<any[]>;
    create(data: any): Promise<any>;
    updateStatus(id: string, status: string): Promise<{
        message: string;
    }>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=permintaanPerubahanData.repository.d.ts.map