import { Request, Response, NextFunction } from 'express';
declare class CutiController {
    static getAllPermintaanCuti(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPermintaanCutiById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPermintaanCutiByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static submitPermintaanCuti(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateStatusCuti(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deletePermintaanCuti(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getSisaCuti(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default CutiController;
//# sourceMappingURL=cuti.controller.d.ts.map