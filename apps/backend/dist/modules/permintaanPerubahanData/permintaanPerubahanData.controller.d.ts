import { Request, Response, NextFunction } from 'express';
declare class PermintaanPerubahanDataController {
    static getAllPermintaanPerubahanData(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPermintaanPerubahanDataById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPermintaanPerubahanDataByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPendingPermintaanPerubahanData(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createPermintaanPerubahanData(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updatePermintaanPerubahanDataStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deletePermintaanPerubahanData(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default PermintaanPerubahanDataController;
//# sourceMappingURL=permintaanPerubahanData.controller.d.ts.map