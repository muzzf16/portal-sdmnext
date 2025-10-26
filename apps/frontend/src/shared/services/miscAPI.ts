import ApiService, { ApiResponse } from './apiService';

// Define the LeaveSummary type (you may want to import this from types)
interface LeaveSummary {
  id: number;
  employee_id: number;
  total_leave_days: number;
  used_leave_days: number;
  remaining_leave_days: number;
}

// Create an instance of ApiService for misc operations
const miscApi = new ApiService<LeaveSummary>('/misc');

// Export the standardized methods
export const getLeaveSummary = (id: string) => miscApi.get(`leave-summary/${id}`);

// Export the instance in case other methods are needed
export default miscApi;
