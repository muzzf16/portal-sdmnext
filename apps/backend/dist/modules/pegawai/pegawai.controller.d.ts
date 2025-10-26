import { Request, Response, NextFunction } from 'express';
declare class PegawaiController {
    static getAllPegawai(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPegawaiById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createPegawai(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updatePegawai(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deletePegawai(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updatePegawaiPayrollInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default PegawaiController;
//# sourceMappingURL=pegawai.controller.d.ts.map