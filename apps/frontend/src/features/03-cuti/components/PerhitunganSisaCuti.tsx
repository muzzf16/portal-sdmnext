import React, { useState, useEffect } from 'react';
import { Table, Badge } from '@/shared/components/ui';
import { usePegawaiList } from '../../01-pegawai/hooks/usePegawaiQuery'; // Mengambil data pegawai dari modul pegawai
import { useCuti } from '../hooks/useCuti'; // Mengambil data cuti yang sudah disetujui
import { normalizeLeaveStatusLabel } from '../hooks/useLeaveQuery';

interface CutiBersama {
  id: string;
  tanggal: string;
  deskripsi: string;
}

interface SisaCutiPegawai {
  id: string;
  nama: string;
  jatahCuti: number;
  cutiDiambil: number;
  cutiBersama: number;
  sisaCuti: number;
}

const PerhitunganSisaCuti: React.FC = () => {
  const { data: pegawaiList, isLoading: pegawaiLoading } = usePegawaiList();
  const { cuti, loading: cutiLoading } = useCuti();
  const [sisaCutiList, setSisaCutiList] = useState<SisaCutiPegawai[]>([]);
  const [jumlahJatahCuti] = useState<number>(18); // Default jatah cuti per tahun
  const [cutiBersama] = useState<CutiBersama[]>([
    { id: '1', tanggal: '2025-01-01', deskripsi: 'Tahun Baru' },
    { id: '2', tanggal: '2025-05-01', deskripsi: 'Hari Buruh Internasional' },
    { id: '3', tanggal: '2025-08-17', deskripsi: 'Hari Kemerdekaan RI' },
  ]);

  useEffect(() => {
    if (pegawaiList && cuti) {
      // Filter cuti yang sudah disetujui (case-insensitive) dan hanya jenis Tahunan
      const approvedLeaves = cuti.filter(c => {
        const statusOk = normalizeLeaveStatusLabel(c.status).value === 'disetujui';
        const type = (c.leaveType || '').toLowerCase();
        const isAnnual = type === 'tahunan' || type === 'annual' || type === 'cuti tahunan';
        return statusOk && isAnnual;
      });
      
      // Hitung sisa cuti untuk setiap pegawai
      const updatedSisaCutiList = pegawaiList.map(pegawai => {
        // Hitung jumlah hari cuti yang sudah diambil oleh pegawai ini
        const cutiPegawai = approvedLeaves.filter(c => c.employeeId === String(pegawai.id));
        let totalCutiDiambil = 0;
        
        cutiPegawai.forEach(cutiItem => {
          const startDate = new Date(cutiItem.startDate);
          const endDate = new Date(cutiItem.endDate);
          
          // Hitung jumlah hari antara tanggal mulai dan selesai
          const timeDiff = endDate.getTime() - startDate.getTime();
          const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 untuk menyertakan hari terakhir
          
          totalCutiDiambil += dayDiff;
        });
        
        // Hitung jumlah cuti bersama di tahun yang sama
        const currentYear = new Date().getFullYear();
        const cutiBersamaTahunIni = cutiBersama.filter(c => 
          new Date(c.tanggal).getFullYear() === currentYear
        ).length;
        
        const sisaCuti = jumlahJatahCuti - totalCutiDiambil - cutiBersamaTahunIni;
        
        return {
          id: String(pegawai.id),
          nama: pegawai.name,
          jatahCuti: jumlahJatahCuti,
          cutiDiambil: totalCutiDiambil,
          cutiBersama: cutiBersamaTahunIni,
          sisaCuti: sisaCuti,
        };
      });
      
      setSisaCutiList(updatedSisaCutiList);
    }
  }, [pegawaiList, cuti, jumlahJatahCuti, cutiBersama]);

  if (pegawaiLoading || cutiLoading) {
    return <div className="text-center py-4">Memuat...</div>;
  }

  const tableHeaders = ['Nama Pegawai', 'Jatah Cuti', 'Cuti Diambil', 'Cuti Bersama', 'Sisa Cuti', 'Status'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-bold text-primary-dark-blue mb-4">Perhitungan Sisa Cuti Pegawai</h2>
      <Table headers={tableHeaders}>
        {sisaCutiList.map((pegawai) => (
          <tr key={pegawai.id}>
            <td className="py-4 px-6">{pegawai.nama}</td>
            <td className="py-4 px-6">{pegawai.jatahCuti} hari</td>
            <td className="py-4 px-6">{pegawai.cutiDiambil} hari</td>
            <td className="py-4 px-6">{pegawai.cutiBersama} hari</td>
            <td className="py-4 px-6 font-semibold">{pegawai.sisaCuti} hari</td>
            <td className="py-4 px-6">
              <Badge 
                variant={
                  pegawai.sisaCuti < 5 ? 'danger' : 
                  pegawai.sisaCuti < 10 ? 'warning' : 'success'
                }
              >
                {pegawai.sisaCuti < 5 ? 'Sedikit' : 
                 pegawai.sisaCuti < 10 ? 'Cukup' : 'Banyak'}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default PerhitunganSisaCuti;
