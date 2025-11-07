"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notifikasi_repository_1 = require("./notifikasi.repository");
const errors_1 = require("../../utils/errors");
class NotifikasiService {
    static async getNotifikasiByEmployeeId(employeeId) {
        try {
            return await notifikasi_repository_1.NotifikasiRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving notifications: ${error.message}`, 500);
        }
    }
    static async getUnreadNotifikasiByEmployeeId(employeeId) {
        try {
            return await notifikasi_repository_1.NotifikasiRepository.findUnreadByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving unread notifications: ${error.message}`, 500);
        }
    }
    static async createNotifikasi(notificationData) {
        try {
            return await notifikasi_repository_1.NotifikasiRepository.create(notificationData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating notification: ${error.message}`, 500);
        }
    }
    static async markNotifikasiAsRead(notificationId) {
        try {
            return await notifikasi_repository_1.NotifikasiRepository.markAsRead(notificationId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error marking notification as read: ${error.message}`, 500);
        }
    }
    static async getScheduledNotifikasi() {
        try {
            return await notifikasi_repository_1.NotifikasiRepository.findScheduledNotifications();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving scheduled notifications: ${error.message}`, 500);
        }
    }
    static async createContractExpirationReminder(employeeId, contractId, daysUntilExpiration) {
        try {
            const message = `Kontrak Anda akan berakhir dalam ${daysUntilExpiration} hari. Silakan hubungi HR untuk perpanjangan.`;
            return await notifikasi_repository_1.NotifikasiRepository.create({
                employee_id: employeeId,
                message: message,
                type: 'warning',
                delivery_channel: 'in_app',
                related_entity: 'contract',
                related_entity_id: contractId,
                scheduled_for: new Date(Date.now() + (daysUntilExpiration * 24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ')
            });
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating contract expiration reminder: ${error.message}`, 500);
        }
    }
    static async createLeaveApprovalNotification(employeeId, leaveRequestId, status) {
        try {
            let message = '';
            if (status === 'disetujui') {
                message = 'Pengajuan cuti Anda telah disetujui.';
            }
            else if (status === 'ditolak') {
                message = 'Pengajuan cuti Anda telah ditolak.';
            }
            else {
                message = 'Status pengajuan cuti Anda telah diperbarui.';
            }
            return await notifikasi_repository_1.NotifikasiRepository.create({
                employee_id: employeeId,
                message: message,
                type: status === 'disetujui' ? 'success' : status === 'ditolak' ? 'error' : 'info',
                delivery_channel: 'in_app',
                related_entity: 'leave',
                related_entity_id: leaveRequestId
            });
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating leave approval notification: ${error.message}`, 500);
        }
    }
}
exports.default = NotifikasiService;
//# sourceMappingURL=notifikasi.service.js.map