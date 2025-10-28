// src/shared/services/kontrakAPI.ts
import api from './api';
import ApiService, { ApiResponse } from './apiService';
import { RiwayatJabatan, Kontrak, Pegawai } from '../types/types';

const contractApi = new ApiService<Kontrak>('/contracts');
const employeeApi = new ApiService<Pegawai>('/employees');

export const getRiwayatJabatan = async (employeeId: string): Promise<ApiResponse<RiwayatJabatan[]>> => {
  const response = await api.get(`/contracts/job-history/employee/${employeeId}`);
  return response.data;
};

export const addRiwayatJabatan = async (employeeId: string, data: Omit<RiwayatJabatan, 'id'>): Promise<ApiResponse<RiwayatJabatan>> => {
  const response = await api.post(`/contracts/job-history/employee/${employeeId}`, data);
  return response.data;
};

export const getEmployees = () => employeeApi.list();

export const getExpiringContractsCount = async () => {
  try {
    const response = await api.get('/contracts/expiring');
    const contracts = response.data.data || [];
    return contracts.length;
  } catch (error) {
    console.error('Error in getExpiringContractsCount:', error);
    return 0;
  }
};

// Export the instances in case other methods are needed
export { contractApi, employeeApi };
export default contractApi;