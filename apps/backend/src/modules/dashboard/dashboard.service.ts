import { DashboardRepository } from './dashboard.repository';
import { AppError } from '../../utils/errors';

class DashboardService {
  static async getRecentActivity() {
    try {
      return await DashboardRepository.getRecentActivity();
    } catch (error: any) {
      throw new AppError(`Error retrieving recent activity: ${error.message}`, 500);
    }
  }
}

export default DashboardService;