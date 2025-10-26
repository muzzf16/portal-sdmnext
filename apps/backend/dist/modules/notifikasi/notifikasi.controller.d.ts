import { Request, Response, NextFunction } from 'express';
declare class NotifikasiController {
    static getNotifikasiByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUnreadNotifikasiByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createNotifikasi(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markNotifikasiAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getScheduledNotifikasi(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default NotifikasiController;
//# sourceMappingURL=notifikasi.controller.d.ts.map