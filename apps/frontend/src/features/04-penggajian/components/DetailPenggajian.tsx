import React, { useState } from 'react';
import { usePenggajian } from '../hooks/usePenggajian';
import ModalTambahKomponenGaji from './ModalTambahKomponenGaji';
import { addSalaryComponent } from '../api/penggajianApi';
import { Penggajian } from '../types';

interface DetailPenggajianProps {
  payrollId: string | undefined;
}

const DetailPenggajian: React.FC<DetailPenggajianProps> = ({ payrollId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!payrollId) {
    return <div>Data penggajian tidak ditemukan</div>;
  }

  const { penggajian, loading, error, setPenggajian } = usePenggajian(payrollId);

  const handleSaveKomponen = async (komponen: { nama: string; jenis: 'tunjangan' | 'potongan'; jumlah: number }) => {
    if (!penggajian) return;

    const componentType = komponen.jenis === 'tunjangan' ? 'income' : 'deduction';

    try {
      const { data: updatedPayroll } = await addSalaryComponent(penggajian.id, {
        name: komponen.nama,
        type: componentType,
        amount: komponen.jumlah,
      });
      setPenggajian(updatedPayroll);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add salary component', error);
      alert('Gagal menambahkan komponen gaji');
    }
  };

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!penggajian) return <div>Data penggajian tidak ditemukan</div>;

  return (
    <div className="mt-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary-dark-blue">{penggajian.employeeName} - {penggajian.period}</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            Tambah Komponen Gaji
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-bold text-lg">Rincian Gaji</h3>
            <p><strong>Gaji Pokok:</strong> {penggajian.baseSalary.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Total</h3>
            <p><strong>Total Pendapatan:</strong> {penggajian.totalIncome.toLocaleString()}</p>
            <p><strong>Gaji Kotor:</strong> {penggajian.grossSalary.toLocaleString()}</p>
            <p><strong>Total Potongan:</strong> {penggajian.totalDeductions.toLocaleString()}</p>
            <p className="font-bold"><strong>Gaji Bersih:</strong> {penggajian.netSalary.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-lg">Tunjangan</h3>
            <ul>
              {penggajian.incomes.map((income, index) => (
                <li key={index} className="flex justify-between">
                  <span>{income.name}</span>
                  <span>{income.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg">Potongan</h3>
            <ul>
              {penggajian.deductions.map((deduction, index) => (
                <li key={index} className="flex justify-between">
                  <span>{deduction.name}</span>
                  <span>{deduction.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
      <ModalTambahKomponenGaji
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveKomponen}
        payrollId={payrollId}
      />
    </div>
  );
};

export default DetailPenggajian;
