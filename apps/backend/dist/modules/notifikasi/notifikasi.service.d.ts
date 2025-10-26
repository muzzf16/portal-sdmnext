declare class NotifikasiService {
    static getNotifikasiByEmployeeId(employeeId: string): Promise<any[]>;
    static getUnreadNotifikasiByEmployeeId(employeeId: string): Promise<any[]>;
    static createNotifikasi(notificationData: {
        employee_id: string;
        message: string;
        type?: string;
        delivery_channel?: string;
        related_entity?: string;
        related_entity_id?: string;
        scheduled_for?: string;
    }): Promise<{
        id: number | undefined;
        employee_id: string;
        message: string;
        type: string;
        delivery_channel: string;
        related_entity: string | undefined;
        related_entity_id: string | undefined;
        scheduled_for: string | undefined;
        is_read: boolean;
        created_at: string;
    }>;
    static markNotifikasiAsRead(notificationId: string): Promise<{
        id: string;
        is_read: boolean;
    }>;
    static getScheduledNotifikasi(): Promise<any[]>;
    static createContractExpirationReminder(employeeId: string, contractId: string, daysUntilExpiration: number): Promise<{
        id: number | undefined;
        employee_id: string;
        message: string;
        type: string;
        delivery_channel: string;
        related_entity: string | undefined;
        related_entity_id: string | undefined;
        scheduled_for: string | undefined;
        is_read: boolean;
        created_at: string;
    }>;
    static createLeaveApprovalNotification(employeeId: string, leaveRequestId: string, status: string): Promise<{
        id: number | undefined;
        employee_id: string;
        message: string;
        type: string;
        delivery_channel: string;
        related_entity: string | undefined;
        related_entity_id: string | undefined;
        scheduled_for: string | undefined;
        is_read: boolean;
        created_at: string;
    }>;
}
export default NotifikasiService;
//# sourceMappingURL=notifikasi.service.d.ts.map