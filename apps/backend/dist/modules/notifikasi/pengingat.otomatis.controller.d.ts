import { Request, Response, NextFunction } from 'express';
declare class PengingatOtomatisController {
    static sendContractExpirationReminders(req: Request, res: Response, next: NextFunction): Promise<void>;
    static sendLeaveApprovalNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    static sendPayrollReleaseNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    static sendPerformanceReviewReminders(req: Request, res: Response, next: NextFunction): Promise<void>;
    static sendBirthdayReminders(req: Request, res: Response, next: NextFunction): Promise<void>;
    static sendAllAutomatedReminders(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default PengingatOtomatisController;
//# sourceMappingURL=pengingat.otomatis.controller.d.ts.map