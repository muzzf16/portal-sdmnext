import { Request, Response, NextFunction } from 'express';
declare class DashboardController {
    static getAdminDashboardData(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    static getEmployeeDashboardData(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    private static getEmployeeStats;
    private static getAttendanceStats;
    private static getLeaveStats;
    private static getPayrollStats;
    private static getPerformanceStats;
    private static getContractStats;
    private static getEmployeeAttendanceSummary;
    private static getEmployeeLeaveSummary;
    private static getEmployeePayrollSummary;
    private static getEmployeePerformanceSummary;
}
export default DashboardController;
//# sourceMappingURL=dashboard.controller.d.ts.map