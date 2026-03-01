import { Request, Response, NextFunction } from 'express';
export default class KpiController {
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getByEmployeePeriod(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static updateActualValue(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static uploadEvidence(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static generateFromAbk(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static syncRealisasiFromWla(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
//# sourceMappingURL=kpi.controller.d.ts.map