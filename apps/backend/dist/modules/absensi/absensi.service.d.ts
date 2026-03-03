declare class AbsensiService {
    static getAllAttendanceRecords(query: any): Promise<any[]>;
    static getAttendanceRecordById(id: string): Promise<any>;
    static clockIn(employeeId: string, employeeName: string): Promise<{
        id: string;
        employeeId: string;
        employeeName: string;
        date: string;
        clockIn: string;
        clockOut: null;
        status: string;
        workDuration: null;
    }>;
    static clockOut(employeeId: string): Promise<{
        message: string;
    }>;
    static getAttendanceByEmployeeId(employeeId: string): Promise<any[]>;
    static createAttendanceRecord(attendanceData: any): Promise<any>;
    static updateAttendanceRecord(id: string, attendanceData: any): Promise<any>;
    static deleteAttendanceRecord(id: string): Promise<{
        message: string;
    }>;
    static parseAndSaveLog(buffer: Buffer): Promise<{
        message: string;
        created: number;
        updated: number;
    }>;
}
export default AbsensiService;
//# sourceMappingURL=absensi.service.d.ts.map