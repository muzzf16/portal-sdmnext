declare class PengingatOtomatisService {
    static sendContractExpirationReminders(): Promise<{
        success: boolean;
        message: string;
        notificationsSent: number;
    }>;
    static sendLeaveApprovalNotifications(): Promise<{
        success: boolean;
        message: string;
        notificationsSent: number;
    }>;
    static sendPayrollReleaseNotifications(): Promise<{
        success: boolean;
        message: string;
        notificationsSent: number;
    }>;
    static sendPerformanceReviewReminders(): Promise<{
        success: boolean;
        message: string;
        notificationsSent: number;
    }>;
    static sendBirthdayReminders(): Promise<{
        success: boolean;
        message: string;
        notificationsSent: number;
    }>;
    private static getEmployeesWithBirthdaysToday;
    private static getTeamMembers;
    static sendAllAutomatedReminders(): Promise<{
        success: boolean;
        message: string;
        results: {
            successful: (PromiseFulfilledResult<{
                success: boolean;
                message: string;
                notificationsSent: number;
            }> | PromiseFulfilledResult<{
                success: boolean;
                message: string;
                notificationsSent: number;
            }> | PromiseFulfilledResult<{
                success: boolean;
                message: string;
                notificationsSent: number;
            }> | PromiseFulfilledResult<{
                success: boolean;
                message: string;
                notificationsSent: number;
            }> | PromiseFulfilledResult<{
                success: boolean;
                message: string;
                notificationsSent: number;
            }>)[];
            failed: PromiseRejectedResult[];
        };
    }>;
}
export default PengingatOtomatisService;
//# sourceMappingURL=pengingat.otomatis.service.d.ts.map