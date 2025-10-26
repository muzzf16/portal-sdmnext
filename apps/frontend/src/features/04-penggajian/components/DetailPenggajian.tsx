import React from 'react';
import { usePenggajian } from '../hooks/usePenggajian';

interface DetailPenggajianProps {
  payrollId: string | undefined;
}

const DetailPenggajian: React.FC<DetailPenggajianProps> = ({ payrollId }) => {
  if (!payrollId) {
    return <div>Data penggajian tidak ditemukan</div>;
  }

  const { penggajian, loading, error } = usePenggajian(payrollId);

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!penggajian) return <div>Data penggajian tidak ditemukan</div>;

  return (
    <div className="mt-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-primary-dark-blue mb-4">{penggajian.employeeName} - {penggajian.period}</h2>
        <p><strong>Gaji Pokok:</strong> {penggajian.baseSalary}</p>
        {/* Add more payroll details here */}
      </div>
    </div>
  );
};

export default DetailPenggajian;
