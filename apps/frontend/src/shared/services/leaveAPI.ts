import {
  getPermintaanCuti,
  getSisaCuti as getLeaveBalance
} from '../../features/03-cuti/api/cutiApi';

export interface LeaveRequest {
  id?: string | number;
  employeeId?: string;
  status_pengajuan?: string;
  status?: string;
  [key: string]: any;
}

export const getLeaveRequests = async () => {
  const response = await getPermintaanCuti();
  return {
    success: true,
    data: response.data
  };
};

export const getPendingLeaveRequestsCount = async () => {
  const response = await getPermintaanCuti({ status: 'menunggu' });
  return response.data.length;
};

export const getEmployeeApprovedLeaveCount = async (employeeId: string) => {
  const response = await getPermintaanCuti({ employeeId, status: 'disetujui' });
  return response.data.length;
};

export default {
  list: getLeaveRequests
};

export const getSisaCuti = (employeeId: string) => getLeaveBalance(employeeId);
