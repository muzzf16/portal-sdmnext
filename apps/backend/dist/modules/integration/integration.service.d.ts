export declare const IntegrationService: {
    getEmployees(): Promise<any[]>;
    getAttendances(options?: {
        startDate?: string;
        endDate?: string;
        employeeId?: string;
    }): Promise<any[]>;
    getLeaves(options?: {
        startDate?: string;
        endDate?: string;
        employeeId?: string;
        status?: string;
    }): Promise<any[]>;
    insertInboundAttendance(payload: {
        nip: string;
        date: string;
        clockIn: string;
        clockOut?: string;
        status?: string;
        notes?: string;
    }): Promise<{
        action: string;
        employeeName: any;
        date: string;
    }>;
    insertInboundDailyActivity(payload: {
        nip: string;
        date: string;
        activityName: string;
        durationMinutes: number;
        notes?: string;
    }): Promise<{
        log_id: number | undefined;
        activityName: string;
        status: string;
    }>;
};
//# sourceMappingURL=integration.service.d.ts.map