import { Request, Response, NextFunction } from 'express';
declare class KontrakController {
    static getAllContracts(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getContractById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getContractsByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createContract(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateContract(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteContract(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getExpiringContracts(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getRiwayatJabatan(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addRiwayatJabatan(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default KontrakController;
//# sourceMappingURL=kontrak.controller.d.ts.map