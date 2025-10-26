import { KandidatRepository } from './kandidat.repository';
import { AppError } from '../../utils/errors';

class PerekrutanService {
  static async getAllKandidat() {
    try {
      return await KandidatRepository.findAll();
    } catch (error: any) {
      throw new AppError(`Error retrieving candidates: ${error.message}`, 500);
    }
  }

  static async getKandidatById(id: string) {
    try {
      const candidate = await KandidatRepository.findById(id);
      if (!candidate) {
        throw new AppError('Candidate not found', 404);
      }
      return candidate;
    } catch (error: any) {
      throw new AppError(`Error retrieving candidate: ${error.message}`, 500);
    }
  }

  static async createKandidat(candidateData: any) {
    try {
      return await KandidatRepository.create(candidateData);
    } catch (error: any) {
      throw new AppError(`Error creating candidate: ${error.message}`, 500);
    }
  }

  static async updateKandidat(id: string, candidateData: any) {
    try {
      return await KandidatRepository.update(id, candidateData);
    } catch (error: any) {
      throw new AppError(`Error updating candidate: ${error.message}`, 500);
    }
  }

  static async deleteKandidat(id: string) {
    try {
      const deleted = await KandidatRepository.delete(id);
      if (!deleted) {
        throw new AppError('Candidate not found', 404);
      }
      return { message: 'Candidate deleted successfully' };
    } catch (error: any) {
      throw new AppError(`Error deleting candidate: ${error.message}`, 500);
    }
  }
}

export default PerekrutanService;