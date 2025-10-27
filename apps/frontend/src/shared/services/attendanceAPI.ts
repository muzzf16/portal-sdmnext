import ApiService, { ApiResponse } from './apiService';
import { Attendance } from '../types/types';

// Create an instance of ApiService for attendance operations
const attendanceApi = new ApiService<Attendance>('/attendance');

// Export the standardized methods
export const getAttendance = () => attendanceApi.list();

export const getTodayAttendanceCount = async () => {
  try {
    const response = await attendanceApi.list();
    console.log('Attendance API response:', response); // Debug log
    
    // Handle both old and new response formats
    const attendanceData = Array.isArray(response.data) ? response.data : response.data?.data || [];
    console.log('Attendance data:', attendanceData); // Debug log
    
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const uniqueEmployeesToday = new Set<number>();

    attendanceData.forEach(record => {
      // Check for both English and Indonesian property names for compatibility
      const recordDate = record.date || record.tanggal;
      const clockIn = record.clock_in || record.jam_masuk;
      
      if (recordDate === today && clockIn) {
        uniqueEmployeesToday.add(record.employee_id || record.id_pegawai);
      }
    });
    return uniqueEmployeesToday.size;
  } catch (error) {
    console.error('Error in getTodayAttendanceCount:', error);
    throw error;
  }
};

export const getEmployeeAttendanceSummary = async (employeeId: string) => {
  try {
    const response = await attendanceApi.list({ employeeId });
    const totalDays = response.data.length;
    // Check for both English and Indonesian property names for compatibility
    const presentDays = response.data.filter(record => 
      (record.status === 'hadir' || record.status_kehadiran === 'hadir')
    ).length;
    return { totalDays, presentDays };
  } catch (error) {
    console.error('Error in getEmployeeAttendanceSummary:', error);
    throw error;
  }
};

export const getEmployeeWeeklyAttendance = async (employeeId: string) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(today.setDate(monday.getDate() + 6));

    const startDate = monday.toISOString().slice(0, 10);
    const endDate = sunday.toISOString().slice(0, 10);

    const response = await attendanceApi.list({ 
      employeeId, 
      startDate, 
      endDate 
    });
    return response.data;
  } catch (error) {
    console.error('Error in getEmployeeWeeklyAttendance:', error);
    throw error;
  }
};

// Export the instance in case other methods are needed
export default attendanceApi;

