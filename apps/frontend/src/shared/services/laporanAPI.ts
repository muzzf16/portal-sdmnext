import ApiService, { ApiResponse } from './apiService';
import { Pegawai, Absensi, Penggajian } from '../types/types';

// Create instances of ApiService for report operations
const laporanPegawaiApi = new ApiService<Pegawai>('/reports/employees');
const laporanAbsensiApi = new ApiService<Absensi>('/reports/attendance');
const laporanPenggajianApi = new ApiService<Penggajian>('/reports/payroll');

// Export the standardized methods
export const getLaporanPegawai = () => laporanPegawaiApi.list();

export const getLaporanAbsensi = (startDate: string, endDate: string) => 
  laporanAbsensiApi.list({ start_date: startDate, end_date: endDate });

export const getLaporanPenggajian = (month: string, year: string) => 
  laporanPenggajianApi.list({ month, year });

// Export the instances in case other methods are needed
export { laporanPegawaiApi, laporanAbsensiApi, laporanPenggajianApi };
export default { laporanPegawaiApi, laporanAbsensiApi, laporanPenggajianApi };