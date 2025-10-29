import { Request, Response, NextFunction } from 'express';
declare class CustomReportController {
    static getReportMetadata(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    static generateCustomReport(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    static exportCustomReport(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
export default CustomReportController;
//# sourceMappingURL=custom-report.controller.d.ts.map