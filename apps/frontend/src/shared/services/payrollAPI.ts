import ApiService, { ApiResponse } from './apiService';
import { Penggajian } from '../types/types';

// Create an instance of ApiService for payroll operations
const payrollApi = new ApiService<Penggajian>('/payrolls');

// Export the standardized methods
export const getPayrolls = () => payrollApi.list();

export const getEmployeeLatestPayroll = async (employeeId: string) => {
  try {
    const response = await payrollApi.list({ employeeId });
    if (response.data.length === 0) {
      return null;
    }
    // Sort by period (YYYY-MM) to get the latest
    const sortedPayrolls = response.data.sort((a, b) => b.period.localeCompare(a.period));
    return sortedPayrolls[0];
  } catch (error) {
    console.error('Error in getEmployeeLatestPayroll:', error);
    throw error;
  }
};

// Export the instance in case other methods are needed
export default payrollApi;
