import { Request, Response, NextFunction } from 'express';
declare class PegawaiController {
    static getAllPegawai(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getPegawaiById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static createPegawai(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static updatePegawai(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static deletePegawai(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static updatePegawaiPayrollInfo(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getGenderDistribution(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getEducationDistribution(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getDepartmentDistribution(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static uploadAvatar: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
}
export default PegawaiController;
//# sourceMappingURL=pegawai.controller.d.ts.map