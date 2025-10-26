import { Request, Response, NextFunction } from 'express';
declare class AbsensiController {
    static getAllAttendanceRecords(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAttendanceRecordById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static clockIn(req: Request, res: Response, next: NextFunction): Promise<void>;
    static clockOut(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAttendanceByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createAttendanceRecord(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateAttendanceRecord(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteAttendanceRecord(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default AbsensiController;
//# sourceMappingURL=absensi.controller.d.ts.map