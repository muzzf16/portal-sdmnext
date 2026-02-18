import { Request, Response, NextFunction } from 'express';
export default class WorkloadController {
    static getAnalysis(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static saveAnalysis(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
//# sourceMappingURL=workload.controller.d.ts.map