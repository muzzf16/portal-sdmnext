export declare const TaskRepository: {
    create(data: any): Promise<any>;
    findById(id: string): Promise<any>;
    findBySupervisorId(supervisor_id: string): Promise<any[]>;
    findByEmployeeId(employee_id: string, status?: string): Promise<any[]>;
    updateStatus(id: string, status: string): Promise<any>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=task.repository.d.ts.map