import { Request, Response, NextFunction } from 'express';
declare class KinerjaController {
    static getAllPenilaianKinerja(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPenilaianKinerjaById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPenilaianKinerjaByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createPenilaianKinerja(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updatePenilaianKinerja(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addFeedbackKinerja(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static deletePenilaianKinerja(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default KinerjaController;
//# sourceMappingURL=kinerja.controller.d.ts.map