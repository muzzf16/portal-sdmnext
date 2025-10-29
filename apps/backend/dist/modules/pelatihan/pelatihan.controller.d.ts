import { Request, Response, NextFunction } from 'express';
declare class PelatihanController {
    static getAllPelatihan(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPelatihanByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addPelatihan(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default PelatihanController;
//# sourceMappingURL=pelatihan.controller.d.ts.map