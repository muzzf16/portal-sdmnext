export declare const AbsensiRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmployeeId(employeeId: string): Promise<any[]>;
    findByDate(employeeId: string, date: string): Promise<any>;
    clockIn(employeeId: string, employeeName: string): Promise<{
        id: string;
        employeeId: string;
        employeeName: string;
        date: string;
        clockIn: string;
        clockOut: null;
        status: string;
        workDuration: null;
    }>;
    clockOut(employeeId: string): Promise<{
        message: string;
    }>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=absensi.repository.d.ts.map