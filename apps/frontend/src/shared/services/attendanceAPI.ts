import api from './api';
import type { Absensi } from '../types/types';

interface AttendanceFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const listAttendance = async (filters?: AttendanceFilters) => {
  const response = await api.get<Absensi[]>('/attendance', { params: filters });
  return response.data;
};

export const getAttendance = () => listAttendance();

export const getTodayAttendanceCount = async () => {
  const attendanceData = await listAttendance();
  const today = formatLocalDate(new Date());
  const uniqueEmployeesToday = new Set<string>();

  attendanceData.forEach((record) => {
    if (record.date === today && record.clockIn) {
      uniqueEmployeesToday.add(String(record.employeeId));
    }
  });

  return uniqueEmployeesToday.size;
};

export const getEmployeeAttendanceSummary = async (employeeId: string) => {
  const attendanceData = await listAttendance({ employeeId });
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter((record) => record.status === 'hadir').length;

  return { totalDays, presentDays };
};

export const getEmployeeWeeklyAttendance = async (employeeId: string) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return listAttendance({
    employeeId,
    startDate: formatLocalDate(monday),
    endDate: formatLocalDate(sunday)
  });
};

export default {
  getAttendance,
  getTodayAttendanceCount,
  getEmployeeAttendanceSummary,
  getEmployeeWeeklyAttendance
};
