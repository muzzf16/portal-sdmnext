import { Request, Response, NextFunction } from 'express';
declare class PenggunaController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAllPengguna(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPenggunaById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updatePengguna(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deletePengguna(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default PenggunaController;
//# sourceMappingURL=pengguna.controller.d.ts.map