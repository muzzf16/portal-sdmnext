declare class OrientasiService {
    static getTugasOrientasiByEmployeeId(employeeId: string): Promise<any[]>;
    static createTugasOrientasi(employeeId: string, taskData: any): Promise<{
        task_name: string;
        description: string;
        due_date: string;
        completed: boolean;
        id: number | undefined;
        employee_id: string;
    }>;
    static updateTugasOrientasi(taskId: string, taskData: any): Promise<{
        task_name: string;
        description: string;
        due_date: string;
        completed: boolean;
        id: string;
    }>;
    static deleteTugasOrientasi(taskId: string): Promise<{
        message: string;
    }>;
}
export default OrientasiService;
//# sourceMappingURL=orientasi.service.d.ts.map