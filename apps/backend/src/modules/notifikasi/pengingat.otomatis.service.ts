import { NotifikasiRepository } from './notifikasi.repository';
import { KontrakRepository } from '../kontrak/kontrak.repository';
import { PermintaanCutiRepository } from '../cuti/permintaanCuti.repository';
import { PenggajianRepository } from '../penggajian/penggajian.repository';
import { PenilaianKinerjaRepository } from '../kinerja/penilaianKinerja.repository';
import { AppError } from '../../utils/errors';

class PengingatOtomatisService {
  // Send contract expiration reminders
  static async sendContractExpirationReminders() {
    try {
      // Get contracts expiring in 30, 14, and 7 days
      const expiringContracts = await KontrakRepository.findExpiringContracts();
      
      const notifications = [];
      
      for (const contract of expiringContracts) {
        // Determine reminder type based on days until expiration
        let daysUntilExpiration = 0;
        if (contract.endDate) {
          const endDate = new Date(contract.endDate);
          const today = new Date();
          daysUntilExpiration = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        let messageType = '';
        if (daysUntilExpiration === 30) {
          messageType = 'kontrak_30_hari';
        } else if (daysUntilExpiration === 14) {
          messageType = 'kontrak_14_hari';
        } else if (daysUntilExpiration === 7) {
          messageType = 'kontrak_7_hari';
        }
        
        if (messageType) {
          const notification = {
            employee_id: contract.employeeId,
            message: `Kontrak Anda akan berakhir dalam ${daysUntilExpiration} hari pada tanggal ${contract.endDate}. Silakan hubungi HR untuk perpanjangan.`,
            type: 'warning',
            delivery_channel: 'in_app',
            related_entity: 'contract',
            related_entity_id: contract.id,
            scheduled_for: new Date().toISOString()
          };
          
          notifications.push(notification);
        }
      }
      
      // Create all notifications
      for (const notification of notifications) {
        await NotifikasiRepository.create(notification);
      }
      
      return {
        success: true,
        message: `Sent ${notifications.length} contract expiration reminders`,
        notificationsSent: notifications.length
      };
    } catch (error: any) {
      throw new AppError(`Error sending contract expiration reminders: ${error.message}`, 500);
    }
  }
  
  // Send leave approval notifications
  static async sendLeaveApprovalNotifications() {
    try {
      // Get recently approved/rejected leave requests
      const recentLeaveRequests = await PermintaanCutiRepository.findRecentlyProcessed();
      
      const notifications = [];
      
      for (const leaveRequest of recentLeaveRequests) {
        const statusText = leaveRequest.status === 'disetujui' ? 'disetujui' : 'ditolak';
        const notification = {
          employee_id: leaveRequest.employeeId,
          message: `Permohonan cuti Anda untuk tanggal ${leaveRequest.startDate} sampai ${leaveRequest.endDate} telah ${statusText}.`,
          type: leaveRequest.status === 'disetujui' ? 'success' : 'error',
          delivery_channel: 'in_app',
          related_entity: 'leave',
          related_entity_id: leaveRequest.id,
          scheduled_for: new Date().toISOString()
        };
        
        notifications.push(notification);
      }
      
      // Create all notifications
      for (const notification of notifications) {
        await NotifikasiRepository.create(notification);
      }
      
      return {
        success: true,
        message: `Sent ${notifications.length} leave approval notifications`,
        notificationsSent: notifications.length
      };
    } catch (error: any) {
      throw new AppError(`Error sending leave approval notifications: ${error.message}`, 500);
    }
  }
  
  // Send payroll release notifications
  static async sendPayrollReleaseNotifications() {
    try {
      // Get recently processed payrolls
      const recentPayrolls = await PenggajianRepository.findRecentlyProcessed();
      
      const notifications = [];
      
      for (const payroll of recentPayrolls) {
        const notification = {
          employee_id: payroll.employeeId,
          message: `Slip gaji untuk periode ${payroll.period} telah tersedia. Silakan cek halaman penggajian.`,
          type: 'info',
          delivery_channel: 'in_app',
          related_entity: 'payroll',
          related_entity_id: payroll.id,
          scheduled_for: new Date().toISOString()
        };
        
        notifications.push(notification);
      }
      
      // Create all notifications
      for (const notification of notifications) {
        await NotifikasiRepository.create(notification);
      }
      
      return {
        success: true,
        message: `Sent ${notifications.length} payroll release notifications`,
        notificationsSent: notifications.length
      };
    } catch (error: any) {
      throw new AppError(`Error sending payroll release notifications: ${error.message}`, 500);
    }
  }
  
  // Send performance review reminders
  static async sendPerformanceReviewReminders() {
    try {
      // Get upcoming performance reviews
      const upcomingReviews = await PenilaianKinerjaRepository.findUpcomingReviews();
      
      const notifications = [];
      
      for (const review of upcomingReviews) {
        const notification = {
          employee_id: review.employeeId,
          message: `Jadwal evaluasi kinerja Anda untuk periode ${review.period} akan segera dilakukan. Silakan siapkan dokumen yang diperlukan.`,
          type: 'info',
          delivery_channel: 'in_app',
          related_entity: 'performance',
          related_entity_id: review.id,
          scheduled_for: new Date().toISOString()
        };
        
        notifications.push(notification);
      }
      
      // Create all notifications
      for (const notification of notifications) {
        await NotifikasiRepository.create(notification);
      }
      
      return {
        success: true,
        message: `Sent ${notifications.length} performance review reminders`,
        notificationsSent: notifications.length
      };
    } catch (error: any) {
      throw new AppError(`Error sending performance review reminders: ${error.message}`, 500);
    }
  }
  
  // Send birthday reminders
  static async sendBirthdayReminders() {
    try {
      // Get employees with birthdays today
      const birthdayEmployees: any[] = await PengingatOtomatisService.getEmployeesWithBirthdaysToday();
      
      const notifications = [];
      
      for (const employee of birthdayEmployees) {
        // Notify team members
        const teamMembers: any[] = await PengingatOtomatisService.getTeamMembers(employee.department);
        
        for (const teamMember of teamMembers) {
          if (teamMember.id !== employee.id) {
            const notification = {
              employee_id: teamMember.id,
              message: `Hari ini ulang tahun ${employee.name}! Jangan lupa memberikan ucapan selamat.`,
              type: 'info',
              delivery_channel: 'in_app',
              related_entity: 'birthday',
              related_entity_id: employee.id,
              scheduled_for: new Date().toISOString()
            };
            
            notifications.push(notification);
          }
        }
      }
      
      // Create all notifications
      for (const notification of notifications) {
        await NotifikasiRepository.create(notification);
      }
      
      return {
        success: true,
        message: `Sent ${notifications.length} birthday reminders`,
        notificationsSent: notifications.length
      };
    } catch (error: any) {
      throw new AppError(`Error sending birthday reminders: ${error.message}`, 500);
    }
  }
  
  // Helper method to get employees with birthdays today
  private static async getEmployeesWithBirthdaysToday(): Promise<any[]> {
    // This would query the database for employees whose dob matches today's date
    // Implementation depends on the specific database structure
    return [];
  }
  
  // Helper method to get team members in the same department
  private static async getTeamMembers(department: string): Promise<any[]> {
    // This would query the database for employees in the same department
    // Implementation depends on the specific database structure
    return [];
  }
  
  // Main method to send all automated reminders
  static async sendAllAutomatedReminders() {
    try {
      const results = await Promise.allSettled([
        PengingatOtomatisService.sendContractExpirationReminders(),
        PengingatOtomatisService.sendLeaveApprovalNotifications(),
        PengingatOtomatisService.sendPayrollReleaseNotifications(),
        PengingatOtomatisService.sendPerformanceReviewReminders(),
        PengingatOtomatisService.sendBirthdayReminders()
      ]);
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      return {
        success: true,
        message: `Sent automated reminders: ${successful.length} successful, ${failed.length} failed`,
        results: {
          successful,
          failed
        }
      };
    } catch (error: any) {
      throw new AppError(`Error sending all automated reminders: ${error.message}`, 500);
    }
  }
}

export default PengingatOtomatisService;