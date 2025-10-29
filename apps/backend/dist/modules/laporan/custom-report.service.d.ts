declare class CustomReportService {
    static generateCustomReport(filters: any, fields: string[], reportType: string): Promise<any[]>;
    private static generateCustomEmployeeReport;
    private static generateCustomAttendanceReport;
    private static generateCustomPayrollReport;
    private static generateCustomLeaveReport;
    private static generateCustomPerformanceReport;
    static getReportMetadata(): Promise<{
        reportTypes: {
            value: string;
            label: string;
        }[];
        availableFields: {
            pegawai: string[];
            absensi: string[];
            penggajian: string[];
            cuti: string[];
            kinerja: string[];
        };
        filterOptions: {
            pegawai: {
                name: string;
                type: string;
                label: string;
            }[];
            absensi: ({
                name: string;
                type: string;
                label: string;
                options?: undefined;
            } | {
                name: string;
                type: string;
                label: string;
                options: string[];
            })[];
            penggajian: {
                name: string;
                type: string;
                label: string;
            }[];
            cuti: ({
                name: string;
                type: string;
                label: string;
                options?: undefined;
            } | {
                name: string;
                type: string;
                label: string;
                options: string[];
            })[];
            kinerja: ({
                name: string;
                type: string;
                label: string;
                options?: undefined;
            } | {
                name: string;
                type: string;
                label: string;
                options: string[];
            })[];
        };
    }>;
}
export default CustomReportService;
//# sourceMappingURL=custom-report.service.d.ts.map