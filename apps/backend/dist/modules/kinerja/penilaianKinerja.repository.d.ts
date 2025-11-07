export declare const PenilaianKinerjaRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmployeeId(employeeId: string): Promise<any[]>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    updateFeedback(id: string, feedback: string): Promise<{
        message: string;
    }>;
    delete(id: string): Promise<boolean>;
    findUpcomingReviews(): Promise<any[]>;
};
//# sourceMappingURL=penilaianKinerja.repository.d.ts.map