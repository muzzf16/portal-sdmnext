import React, { useMemo, useState } from 'react';
import { Absensi } from '../types';
import { Table, Badge } from '@/shared/components/ui';

interface DaftarAbsensiPegawaiProps {
  absensi: Absensi[];
  loading: boolean;
  error: Error | null;
}

const DaftarAbsensiPegawai: React.FC<DaftarAbsensiPegawaiProps> = ({ absensi, loading, error }) => {
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const groupedByMonth = useMemo(() => {
    if (!absensi) return {};

    const sortedAbsensi = [...absensi].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sortedAbsensi.reduce((acc, record) => {
      // Parse YYYY-MM
      const dateParts = record.date.split('-');
      const monthYearKey = dateParts.length >= 2 ? `${dateParts[0]}-${dateParts[1]}` : 'Lainnya';

      if (!acc[monthYearKey]) {
        acc[monthYearKey] = [];
      }
      acc[monthYearKey].push(record);
      return acc;
    }, {} as Record<string, typeof absensi>);
  }, [absensi]);

  if (loading) return <div className="text-center py-8">Memuat data absensi...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Gagal memuat absensi: {error.message}</div>;

  const tableHeaders = ['Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Durasi Kerja', 'Catatan'];

  const months = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a)); // Descending

  return (
    <div className="mt-6 space-y-6">
      {months.map((monthKey, index) => {
        const records = groupedByMonth[monthKey];
        // Display top 2 months open by default
        const isExpanded = expandedMonths[monthKey] ?? index < 2;

        const totalHadir = records.filter(r => r.status === 'hadir').length;
        const totalTerlambat = records.filter(r => r.status === 'terlambat').length;
        const totalIzin = records.filter(r => ['izin', 'sakit', 'cuti'].includes(r.status.toLowerCase())).length;

        // Convert YYYY-MM to readable text
        let displayMonth = monthKey;
        if (monthKey !== 'Lainnya') {
          const date = new Date(`${monthKey}-01`);
          displayMonth = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        }

        return (
          <div key={monthKey} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer select-none"
              onClick={() => setExpandedMonths(prev => ({ ...prev, [monthKey]: !isExpanded }))}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{displayMonth}</h3>
                  <p className="text-sm text-gray-500">{records.length} hari</p>
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

      {months.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Belum ada data absensi untuk Anda.
        </div>
      )}
    </div>
  );
};

export default DaftarAbsensiPegawai;
