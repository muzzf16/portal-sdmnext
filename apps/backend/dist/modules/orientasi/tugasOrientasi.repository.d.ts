export declare const TugasOrientasiRepository: {
    findByEmployeeId(employeeId: string): Promise<any[]>;
    create(employeeId: string, data: {
        task_name: string;
        description: string;
        due_date: string;
        completed: boolean;
    }): Promise<{
        task_name: string;
        description: string;
        due_date: string;
        completed: boolean;
        id: number | undefined;
        employee_id: string;
    }>;
    update(id: string, data: {
        task_name: string;
        description: string;
        due_date: string;
        completed: boolean;
    }): Promise<{
        task_name: string;
        description: string;
        due_date: string;
        completed: boolean;
        id: string;
    }>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=tugasOrientasi.repository.d.ts.map