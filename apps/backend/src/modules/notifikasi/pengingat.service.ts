// src/modules/notifikasi/pengingat.service.ts
import NotifikasiService from './notifikasi.service';
import KontrakService from '../kontrak/kontrak.service';
import { AppError } from '../../utils/errors';

class PengingatService {
  // Method to send contract expiration reminders
  static async sendContractExpirationReminders() {
    try {
      // Get contracts that are expiring in the next 30, 14, and 7 days
      const allExpiringContracts = [
        ...await KontrakService.getExpiringContracts(30),
        ...await KontrakService.getExpiringContracts(14),
        ...await KontrakService.getExpiringContracts(7)
      ];

      // Create notifications for each expiring contract
      for (const contract of allExpiringContracts) {
        // Determine which reminder period this is for
        const daysToExpiration = Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if ([30, 14, 7].includes(daysToExpiration)) {
          await NotifikasiService.createContractExpirationReminder(
            contract.employeeId, 
            contract.id, 
            daysToExpiration
          );
        }
      }

      return { message: `${allExpiringContracts.length} contract expiration reminders scheduled` };
    } catch (error: any) {
      throw new AppError(`Error sending contract expiration reminders: ${error.message}`, 500);
    }
  }

  // Method to handle other types of reminders could be added here
  // For example, performance review reminders, payroll notifications, etc.
}

export default PengingatService;