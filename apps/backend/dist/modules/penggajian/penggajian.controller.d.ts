import { Request, Response, NextFunction } from 'express';
declare class PenggajianController {
    static getAllPenggajian(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPenggajianById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPenggajianByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createPenggajian(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updatePenggajian(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deletePenggajian(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addSalaryComponent(req: Request, res: Response, next: NextFunction): Promise<void>;
    static runPayroll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static downloadPayslip(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default PenggajianController;
//# sourceMappingURL=penggajian.controller.d.ts.map