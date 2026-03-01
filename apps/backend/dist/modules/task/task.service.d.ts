export declare const TaskService: {
    createTask(data: any): Promise<any>;
    getTasksBySupervisor(supervisor_id: string): Promise<any[]>;
    getTasksByEmployee(employee_id: string, status?: string): Promise<any[]>;
    updateTaskStatus(id: string, status: string): Promise<any>;
    deleteTask(id: string): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=task.service.d.ts.map