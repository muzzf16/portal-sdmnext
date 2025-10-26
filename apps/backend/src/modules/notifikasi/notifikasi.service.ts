import { NotifikasiRepository } from './notifikasi.repository';
import { AppError } from '../../utils/errors';

class NotifikasiService {
  static async getNotifikasiByEmployeeId(employeeId: string) {
    try {
      return await NotifikasiRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving notifications: ${error.message}`, 500);
    }
  }

  static async getUnreadNotifikasiByEmployeeId(employeeId: string) {
    try {
      return await NotifikasiRepository.findUnreadByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving unread notifications: ${error.message}`, 500);
    }
  }

  static async createNotifikasi(notificationData: { employee_id: string, message: string, type?: string, delivery_channel?: string, related_entity?: string, related_entity_id?: string, scheduled_for?: string }) {
    try {
      return await NotifikasiRepository.create(notificationData);
    } catch (error: any) {
      throw new AppError(`Error creating notification: ${error.message}`, 500);
    }
  }

  static async markNotifikasiAsRead(notificationId: string) {
    try {
      return await NotifikasiRepository.markAsRead(notificationId);
    } catch (error: any) {
      throw new AppError(`Error marking notification as read: ${error.message}`, 500);
    }
  }

  // Service method for scheduled notifications
  static async getScheduledNotifikasi() {
    try {
      return await NotifikasiRepository.findScheduledNotifications();
    } catch (error: any) {
      throw new AppError(`Error retrieving scheduled notifications: ${error.message}`, 500);
    }
  }

  // Service method to create contract expiration reminder
  static async createContractExpirationReminder(employeeId: string, contractId: string, daysUntilExpiration: number) {
    try {
      const message = `Kontrak Anda akan berakhir dalam ${daysUntilExpiration} hari. Silakan hubungi HR untuk perpanjangan.`;
      return await NotifikasiRepository.create({
        employee_id: employeeId,
        message: message,
        type: 'warning',
        delivery_channel: 'in_app',
        related_entity: 'contract',
        related_entity_id: contractId,
        scheduled_for: new Date(Date.now() + (daysUntilExpiration * 24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ')  // Schedule for X days from now
      });
    } catch (error: any) {
      throw new AppError(`Error creating contract expiration reminder: ${error.message}`, 500);
    }
  }

  // Service method to create leave approval notification
  static async createLeaveApprovalNotification(employeeId: string, leaveRequestId: string, status: string) {
    try {
      let message = '';
      if (status === 'disetujui') {
        message = 'Pengajuan cuti Anda telah disetujui.';
      } else if (status === 'ditolak') {
        message = 'Pengajuan cuti Anda telah ditolak.';
      } else {
        message = 'Status pengajuan cuti Anda telah diperbarui.';
      }
      
      return await NotifikasiRepository.create({
        employee_id: employeeId,
        message: message,
        type: status === 'disetujui' ? 'success' : status === 'ditolak' ? 'error' : 'info',
        delivery_channel: 'in_app',
        related_entity: 'leave',
        related_entity_id: leaveRequestId
      });
    } catch (error: any) {
      throw new AppError(`Error creating leave approval notification: ${error.message}`, 500);
    }
  }
}

export default NotifikasiService;