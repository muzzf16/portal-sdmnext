export declare const PenggajianRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmployeeId(employeeId: string): Promise<any[]>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<boolean>;
    findRecentlyProcessed(): Promise<any[]>;
};
//# sourceMappingURL=penggajian.repository.d.ts.map