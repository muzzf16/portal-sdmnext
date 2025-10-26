
import { PenilaianKinerjaRepository } from './penilaianKinerja.repository';
import { AppError } from '../../utils/errors';

class KinerjaService {
  static async getAllPenilaianKinerja() {
    try {
      return await PenilaianKinerjaRepository.findAll();
    } catch (error: any) {
      throw new AppError(`Error retrieving performance reviews: ${error.message}`, 500);
    }
  }

  static async getPenilaianKinerjaById(id: string) {
    try {
      const review = await PenilaianKinerjaRepository.findById(id);
      if (!review) {
        throw new AppError('Performance review not found', 404);
      }
      return review;
    } catch (error: any) {
      if (error.message === 'Performance review not found') {
        throw error;
      }
      throw new AppError(`Error retrieving performance review: ${error.message}`, 500);
    }
  }

  static async getPenilaianKinerjaByEmployeeId(employeeId: string) {
    try {
      return await PenilaianKinerjaRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving performance reviews for employee: ${error.message}`, 500);
    }
  }

  static async createPenilaianKinerja(reviewData: any) {
    try {
      return await PenilaianKinerjaRepository.create(reviewData);
    } catch (error: any) {
      throw new AppError(`Error creating performance review: ${error.message}`, 500);
    }
  }

  static async updatePenilaianKinerja(id: string, reviewData: any) {
    try {
      const updatedReview = await PenilaianKinerjaRepository.update(id, reviewData);
      if (!updatedReview) {
        throw new AppError('Performance review not found', 404);
      }
      return updatedReview;
    } catch (error: any) {
      if (error.message === 'Performance review not found') {
        throw error;
      }
      throw new AppError(`Error updating performance review: ${error.message}`, 500);
    }
  }

  static async addFeedbackKinerja(id: string, feedback: string) {
    try {
      return await PenilaianKinerjaRepository.updateFeedback(id, feedback);
    } catch (error: any) {
      if (error.message === 'Review not found') {
        throw new AppError('Review not found', 404);
      }
      throw new AppError(`Error adding performance review feedback: ${error.message}`, 500);
    }
  }

  static async deletePenilaianKinerja(id: string) {
    try {
      const deleted = await PenilaianKinerjaRepository.delete(id);
      if (!deleted) {
        throw new AppError('Performance review not found', 404);
      }
      return { message: 'Performance review deleted successfully' };
    } catch (error: any) {
      if (error.message === 'Performance review not found') {
        throw error;
      }
      throw new AppError(`Error deleting performance review: ${error.message}`, 500);
    }
  }
}

export default KinerjaService;
