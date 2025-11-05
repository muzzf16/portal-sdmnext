// src/modules/kontrak/kontrak.service.ts
import { KontrakRepository } from './kontrak.repository';
import { RiwayatJabatanRepository } from './riwayatJabatan.repository';
import { AppError } from '../../utils/errors';
import { openDb } from '../../config/db';

class KontrakService {
  // Contract Management Methods
  static async getAllContracts() {
    try {
      return await KontrakRepository.findAll();
    } catch (error: any) {
      throw new AppError(`Error retrieving contracts: ${error.message}`, 500);
    }
  }

  static async getContractById(id: string) {
    try {
      const contract = await KontrakRepository.findById(id);
      if (!contract) {
        throw new AppError('Contract not found', 404);
      }
      return contract;
    } catch (error: any) {
      if (error.statusCode === 404) throw error;
      throw new AppError(`Error retrieving contract: ${error.message}`, 500);
    }
  }

  static async getContractsByEmployeeId(employeeId: string) {
    try {
      return await KontrakRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving contracts for employee: ${error.message}`, 500);
    }
  }

  static async createContract(contractData: any) {
    try {
      // Create the contract first
      const newContract = await KontrakRepository.create(contractData);
      
      // If riwayat jabatan should be added and data is provided
      if (contractData.addRiwayatJabatan && contractData.riwayatJabatan && newContract.employeeId) {
        try {
          await RiwayatJabatanRepository.create(newContract.employeeId, contractData.riwayatJabatan);
        } catch (riwayatError: any) {
          // Log error but don't fail the contract creation
          console.error('Error adding riwayat jabatan:', riwayatError);
        }
      }
      
      return newContract;
    } catch (error: any) {
      throw new AppError(`Error creating contract: ${error.message}`, 500);
    }
  }

  static async updateContract(id: string, contractData: any) {
    try {
      const existingContract = await KontrakRepository.findById(id);
      if (!existingContract) {
        throw new AppError('Contract not found', 404);
      }
      return await KontrakRepository.update(id, contractData);
    } catch (error: any) {
      if (error.statusCode === 404) throw error;
      throw new AppError(`Error updating contract: ${error.message}`, 500);
    }
  }

  static async deleteContract(id: string) {
    try {
      const existingContract = await KontrakRepository.findById(id);
      if (!existingContract) {
        throw new AppError('Contract not found', 404);
      }
      return await KontrakRepository.delete(id);
    } catch (error: any) {
      if (error.statusCode === 404) throw error;
      throw new AppError(`Error deleting contract: ${error.message}`, 500);
    }
  }

  // Additional service methods for contract management
  static async getExpiringContracts(days: number = 30) {
    try {
      const db = await openDb();
      // Get contracts that expire within the specified number of days
      const query = `
        SELECT * FROM kontrak 
        WHERE status = 'active' 
        AND endDate BETWEEN date('now') AND date('now', '+${days} days')
        ORDER BY endDate ASC
      `;
      const rows = await db.all(query);
      return rows;
    } catch (error: any) {
      throw new AppError(`Error retrieving expiring contracts: ${error.message}`, 500);
    }
  }

  // Job History (Riwayat Jabatan) Methods
  static async getRiwayatJabatan(employeeId: string) {
    try {
      return await RiwayatJabatanRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving job history: ${error.message}`, 500);
    }
  }

  static async addRiwayatJabatan(employeeId: string, riwayatJabatanData: any) {
    try {
      return await RiwayatJabatanRepository.create(employeeId, riwayatJabatanData);
    } catch (error: any) {
      throw new AppError(`Error adding job history: ${error.message}`, 500);
    }
  }
}

export default KontrakService;