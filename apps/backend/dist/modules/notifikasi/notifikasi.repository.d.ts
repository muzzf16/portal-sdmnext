export declare const NotifikasiRepository: {
    findByEmployeeId(employeeId: string): Promise<any[]>;
    findUnreadByEmployeeId(employeeId: string): Promise<any[]>;
    create(notificationData: {
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
        is_read: boolean;
        created_at: string;
        scheduled_for: string | undefined;
        delivery_channel: string;
        related_entity: string | undefined;
        related_entity_id: string | undefined;
    }>;
    markAsRead(notificationId: string): Promise<{
        id: string;
        is_read: boolean;
    }>;
    findScheduledNotifications(): Promise<any[]>;
};
//# sourceMappingURL=notifikasi.repository.d.ts.map