import { Request, Response, NextFunction } from 'express';
declare class PerekrutanController {
    static getAllKandidat(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getKandidatById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createKandidat(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateKandidat(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteKandidat(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default PerekrutanController;
//# sourceMappingURL=perekrutan.controller.d.ts.map