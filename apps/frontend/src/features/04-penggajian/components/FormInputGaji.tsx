import React, { useState } from 'react';
import { runPayroll } from '../api/penggajianApi';
import { getPegawai } from '../../01-pegawai/api/employeeApi';
import { Button } from '@/shared/components/ui/Button';
import MonthPicker from '@/shared/components/ui/MonthPicker';

interface FormInputGajiProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const FormInputGaji: React.FC<FormInputGajiProps> = ({ onSuccess, onCancel }) => {
  const [period, setPeriod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!period) {
      alert('Pilih periode terlebih dahulu');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Get Active Employees count
      const employees = await getPegawai();
      const activeCount = Array.isArray(employees)
        ? employees.filter(e => e.isActive === 1 || e.isActive === true).length // Hande both 1/0 and bool
        : (employees.data || []).filter((e: any) => e.isActive === 1 || e.isActive === true).length;

      // 2. Confirmation
      const confirmMsg = `Akan memproses gaji untuk ${activeCount} pegawai aktif periode ${period}.\n\nLanjutkan?`;
      if (!window.confirm(confirmMsg)) {
        setIsLoading(false);
        return;
      }

      // 3. Run Payroll
      await runPayroll(period);
      alert('Penggajian berhasil digenerate! Status: Draft.');
      onSuccess();
    } catch (err) {
      setError('Gagal mengenerate penggajian. ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Input Gaji Bulanan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <MonthPicker
            value={period}
            onChange={setPeriod}
            label="Periode Gaji"
            className="mb-4"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Generate Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormInputGaji;
