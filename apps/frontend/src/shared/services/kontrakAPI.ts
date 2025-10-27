// src/shared/services/kontrakAPI.ts
import ApiService, { ApiResponse } from './apiService';
import { RiwayatJabatan, Kontrak, Pegawai } from '../types/types';

// Create instances of ApiService for contract operations
const riwayatJabatanApi = new ApiService<RiwayatJabatan>('/pegawai');
const employeeApi = new ApiService<Pegawai>('/employees');

export const getRiwayatJabatan = (employeeId: string) => riwayatJabatanApi.list({ employeeId });
export const addRiwayatJabatan = (employeeId: string, data: Omit<RiwayatJabatan, 'id'>) => riwayatJabatanApi.create({ employeeId, ...data });

export const getEmployees = () => employeeApi.list();

export const getExpiringContractsCount = async () => {
  try {
    const response = await employeeApi.list();
    console.log('Employee API response (for contracts):', response); // Debug log
    
    // Handle both old and new response formats
    const employeesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
    console.log('Employee data (for contracts):', employeesData); // Debug log
    
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    // Check for both English and Indonesian date fields in employee records
    return employeesData.filter(employee => {
      // Check for tanggal_keluar (end date of employment) in Indonesian
      if (employee.tanggal_keluar) {
        const endDate = new Date(employee.tanggal_keluar);
        return endDate > today && endDate <= thirtyDaysLater;
      }
      // If no specific end date, we might check for temporary contract dates
      // Check for date fields in different possible formats
      if (employee.end_date || employee.endDate || employee.kontrak_berakhir) {
        const dateStr = employee.end_date || employee.endDate || employee.kontrak_berakhir;
        const endDate = new Date(dateStr);
        return endDate > today && endDate <= thirtyDaysLater;
      }
      return false;
    }).length;
  } catch (error) {
    console.error('Error in getExpiringContractsCount:', error);
    throw error;
  }
};

// Export the instances in case other methods are needed
export { riwayatJabatanApi, employeeApi };
export default employeeApi;