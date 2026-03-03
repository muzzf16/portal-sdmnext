import React, { useMemo, useState } from 'react';
import { useAbsensi } from '../hooks/useAbsensi';
import { Table, Badge, Button } from '@/shared/components/ui';
import * as XLSX from 'xlsx';

const DaftarAbsensi: React.FC = () => {
  const { absensi, loading, error } = useAbsensi();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployees, setExpandedEmployees] = useState<Record<string, boolean>>({});

  // Group attendance records by employee
  const groupedAbsensi = useMemo(() => {
    if (!absensi) return {};

    // Sort absensi by date descending first before grouping
    const sortedAbsensi = [...absensi].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sortedAbsensi.reduce((acc, record) => {
      const key = record.employeeName || record.employeeId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
      return acc;
    }, {} as Record<string, typeof absensi>);
  }, [absensi]);

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Durasi Kerja', 'Catatan'];

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(absensi.map(item => ({
      'Nama Pegawai': item.employeeName,
      'Tanggal': item.date,
      'Jam Masuk': item.clockIn,
      'Jam Keluar': item.clockOut,
      'Status': item.status,
      'Durasi Kerja': item.workDuration,
      'Catatan': item.notes
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');
    XLSX.writeFile(workbook, 'rekap_absensi.xls');
  };

  const filteredEmployees = Object.keys(groupedAbsensi).filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Cari nama pegawai..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleExport} className="w-full sm:w-auto">Export to Excel</Button>
      </div>

      <div className="space-y-8">
        {filteredEmployees.map(employeeName => {
          const records = groupedAbsensi[employeeName];

          // Calculate summary for this employee
          const totalHadir = records.filter(r => r.status === 'hadir').length;
          const totalTerlambat = records.filter(r => r.status === 'terlambat').length;
          const totalIzin = records.filter(r => ['izin', 'sakit', 'cuti'].includes(r.status.toLowerCase())).length;

          const isExpanded = !!expandedEmployees[employeeName];

          return (
            <div key={employeeName} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer select-none"
                onClick={() => setExpandedEmployees(prev => ({ ...prev, [employeeName]: !prev[employeeName] }))}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    {employeeName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{employeeName}</h3>
                    <p className="text-sm text-gray-500">{records.length} rekam jejak</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 sm:mt-0 w-full sm:w-auto">
                  <div className="flex gap-2 text-xs font-medium w-full sm:w-auto justify-between sm:justify-end">
                    <span className="px-2.5 py-1 bg-green-50 justify-center text-green-700 min-w-20 text-center rounded-md border border-green-100">
                      Hadir: <span className="font-bold">{totalHadir}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-yellow-50 justify-center text-yellow-700 min-w-20 text-center rounded-md border border-yellow-100">
                      Telat: <span className="font-bold">{totalTerlambat}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-blue-50 justify-center text-blue-700 min-w-20 text-center rounded-md border border-blue-100">
                      Izin: <span className="font-bold">{totalIzin}</span>
                    </span>
                  </div>
                  <div className="text-gray-400 hidden sm:block">
                    {isExpanded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-5 pt-5 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table headers={tableHeaders}>
                      {records.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50 bg-white">
                          <td className="py-2.5 px-4 whitespace-nowrap text-sm">{record.date}</td>
                          <td className="py-2.5 px-4 whitespace-nowrap text-sm">{record.clockIn || '-'}</td>
                          <td className="py-2.5 px-4 whitespace-nowrap text-sm">{record.clockOut || '-'}</td>
                          <td className="py-2.5 px-4 whitespace-nowrap text-sm">
                            <Badge
                              variant={
                                record.status === 'hadir' ? 'success' :
                                  record.status === 'terlambat' ? 'warning' :
                                    record.status === 'izin' ? 'info' :
                                      record.status === 'sakit' ? 'warning' :
                                        record.status === 'cuti' ? 'secondary' : 'danger'
                              }
                            >
                              {record.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap font-medium text-gray-600 text-sm">{record.workDuration || '-'}</td>
                          <td className="py-2.5 px-4 whitespace-nowrap text-xs text-gray-500">{record.notes || '-'}</td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            Tidak ada data absensi yang ditemukan.
          </div>
        )}
      </div>
    </div>
  );
};

export default DaftarAbsensi;
