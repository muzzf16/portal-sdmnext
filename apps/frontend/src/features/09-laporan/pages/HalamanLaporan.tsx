import React, { useState } from 'react';
import { getLaporanPegawai, getLaporanAbsensi, getLaporanPenggajian } from '../../../shared/services/laporanAPI';
import { Pegawai, Absensi, Penggajian } from '../../../shared/types/types';

const HalamanLaporan: React.FC = () => {
  const [reportType, setReportType] = useState<string>('employee');
  const [employeeReport, setEmployeeReport] = useState<Pegawai[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<Absensi[]>([]);
  const [payrollReport, setPayrollReport] = useState<Penggajian[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      if (reportType === 'employee') {
        const response = await getLaporanPegawai();
        setEmployeeReport(response.data);
      } else if (reportType === 'attendance') {
        const response = await getLaporanAbsensi(startDate, endDate);
        setAttendanceReport(response.data);
      } else if (reportType === 'payroll') {
        const response = await getLaporanPenggajian(month, year);
        setPayrollReport(response.data);
      }
    } catch (err) {
      setError('Gagal membuat laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Laporan & Analitik</h1>

      <div className="mb-4">
        <label className="block text-gray-700">Pilih Jenis Laporan:</label>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-3 py-2 border rounded">
          <option value="employee">Laporan Pegawai</option>
          <option value="attendance">Laporan Kehadiran</option>
          <option value="payroll">Laporan Penggajian</option>
        </select>
      </div>

      {reportType === 'attendance' && (
        <div className="mb-4 flex space-x-4">
          <div>
            <label className="block text-gray-700">Tanggal Mulai:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Tanggal Selesai:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border rounded" />
          </div>
        </div>
      )}

      {reportType === 'payroll' && (
        <div className="mb-4 flex space-x-4">
          <div>
            <label className="block text-gray-700">Bulan:</label>
            <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="MM" className="px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Tahun:</label>
            <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="YYYY" className="px-3 py-2 border rounded" />
          </div>
        </div>
      )}

      <button onClick={handleGenerateReport} className="bg-blue-500 text-white px-4 py-2 rounded mb-4" disabled={loading}>
        {loading ? 'Membuat laporan...' : 'Buat Laporan'}
      </button>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {reportType === 'employee' && employeeReport.length > 0 && (
        <div className="overflow-x-auto">
          <h2 className="text-xl font-bold mb-2">Laporan Pegawai</h2>
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Nama</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Posisi</th>
                <th className="py-2 px-4 border-b">Departemen</th>
                <th className="py-2 px-4 border-b">Tanggal Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {employeeReport.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{employee.id}</td>
                  <td className="py-2 px-4 border-b">{employee.name}</td>
                  <td className="py-2 px-4 border-b">{employee.email}</td>
                  <td className="py-2 px-4 border-b">{employee.position}</td>
                  <td className="py-2 px-4 border-b">{employee.department}</td>
                  <td className="py-2 px-4 border-b">{new Date(employee.joinDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'attendance' && attendanceReport.length > 0 && (
        <div className="overflow-x-auto">
          <h2 className="text-xl font-bold mb-2">Laporan Kehadiran</h2>
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID Pegawai</th>
                <th className="py-2 px-4 border-b">Tanggal</th>
                <th className="py-2 px-4 border-b">Jam Masuk</th>
                <th className="py-2 px-4 border-b">Jam Keluar</th>
              </tr>
            </thead>
            <tbody>
              {attendanceReport.map((att, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{att.employee_id}</td>
                  <td className="py-2 px-4 border-b">{new Date(att.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">{att.clock_in}</td>
                  <td className="py-2 px-4 border-b">{att.clock_out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'payroll' && payrollReport.length > 0 && (
        <div className="overflow-x-auto">
          <h2 className="text-xl font-bold mb-2">Laporan Penggajian</h2>
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID Pegawai</th>
                <th className="py-2 px-4 border-b">Periode</th>
                <th className="py-2 px-4 border-b">Gaji Pokok</th>
                <th className="py-2 px-4 border-b">Tunjangan</th>
                <th className="py-2 px-4 border-b">Potongan</th>
                <th className="py-2 px-4 border-b">Gaji Bersih</th>
              </tr>
            </thead>
            <tbody>
              {payrollReport.map((pay, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{pay.employee_id}</td>
                  <td className="py-2 px-4 border-b">{pay.period}</td>
                  <td className="py-2 px-4 border-b">{pay.base_salary}</td>
                  <td className="py-2 px-4 border-b">{pay.total_allowances}</td>
                  <td className="py-2 px-4 border-b">{pay.total_deductions}</td>
                  <td className="py-2 px-4 border-b">{pay.net_salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HalamanLaporan;