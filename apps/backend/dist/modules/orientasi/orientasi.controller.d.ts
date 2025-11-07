import { Request, Response, NextFunction } from 'express';
declare class OrientasiController {
    static getTugasOrientasiByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createTugasOrientasi(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateTugasOrientasi(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteTugasOrientasi(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default OrientasiController;
//# sourceMappingURL=orientasi.controller.d.ts.map