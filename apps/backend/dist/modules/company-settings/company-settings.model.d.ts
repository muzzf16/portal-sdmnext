export interface CompanySettings {
    id: number;
    companyName: string;
    npwp: string;
    address: string;
    logo: string;
    workStartTime?: string;
    workEndTime?: string;
    lateToleranceMinutes?: number;
    annualLeaveQuota?: number;
    sickLeaveQuota?: number;
    maternityLeaveQuota?: number;
    personalLeaveQuota?: number;
    carryOverPolicy?: string;
    probationMonths?: number;
    bankName?: string;
    bankAccountNumber?: string;
    payrollDate?: number;
    overtimeMultiplier?: number;
    thrPolicy?: string;
}
//# sourceMappingURL=company-settings.model.d.ts.map