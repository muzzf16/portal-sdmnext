import ApiService, { ApiResponse } from './apiService';
import { LeaveRequest } from '../types/types';

// Create an instance of ApiService for leave operations
const leaveApi = new ApiService<LeaveRequest>('/leave-requests');

// Export the standardized methods
export const getLeaveRequests = () => leaveApi.list();

export const getPendingLeaveRequestsCount = async () => {
  try {
    const response = await leaveApi.list();
    return response.data.filter(request => request.status_pengajuan === 'menunggu').length;
  } catch (error) {
    console.error('Error in getPendingLeaveRequestsCount:', error);
    throw error;
  }
};

export const getEmployeeApprovedLeaveCount = async (employeeId: string) => {
  try {
    const response = await leaveApi.list({ employeeId });
    return response.data.filter(request => request.status_pengajuan === 'disetujui').length;
  } catch (error) {
    console.error('Error in getEmployeeApprovedLeaveCount:', error);
    throw error;
  }
};

// Export the instance in case other methods are needed
export default leaveApi;
