// src/shared/services/kontrakAPI.ts
import ApiService, { ApiResponse } from './apiService';
import { RiwayatJabatan, Kontrak } from '../types/types';

// Create instances of ApiService for contract operations
const riwayatJabatanApi = new ApiService<RiwayatJabatan>('/pegawai');
const contractsApi = new ApiService<Kontrak>('/contracts');

export const getRiwayatJabatan = (employeeId: string) => riwayatJabatanApi.list({ employeeId });
export const addRiwayatJabatan = (employeeId: string, data: Omit<RiwayatJabatan, 'id'>) => riwayatJabatanApi.create({ employeeId, ...data });

export const getContracts = () => contractsApi.list();

export const getExpiringContractsCount = async () => {
  try {
    const response = await contractsApi.list();
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    return response.data.filter(contract => {
      const endDate = new Date(contract.endDate);
      return endDate > today && endDate <= thirtyDaysLater;
    }).length;
  } catch (error) {
    console.error('Error in getExpiringContractsCount:', error);
    throw error;
  }
};

// Export the instances in case other methods are needed
export { riwayatJabatanApi, contractsApi };
export default contractsApi;