import api from './api';
import ApiService from './apiService';

// Minimal local LeaveRequest interface to match the properties used in this module.
// This avoids relying on a non-existent export from ../types/types.
export interface LeaveRequest {
  id?: string | number;
  employeeId?: string;
  status_pengajuan?: string;
  status?: string;
  [key: string]: any;
}

// Create an instance of ApiService for leave operations
const leaveApi = new ApiService<LeaveRequest>('/leave-requests');

// Export the standardized methods
export const getLeaveRequests = () => leaveApi.list();

export const getPendingLeaveRequestsCount = async () => {
  try {
    const response: any = await leaveApi.list();
    console.log('Leave API response:', response); // Debug log
    
    // Handle both old and new response formats
    const leaveData = Array.isArray(response.data) ? response.data : response.data?.data || [];
    console.log('Leave data:', leaveData); // Debug log
    
    return leaveData.filter((request: LeaveRequest) => 
      request.status_pengajuan === 'menunggu' || request.status === 'menunggu'
    ).length;
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

export const getSisaCuti = (employeeId: string) => api.get(`/leave-requests/sisa-cuti/${employeeId}`);
