import React, { useState } from 'react';
import { runPayroll } from '../api/penggajianApi';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

interface FormInputGajiProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const FormInputGaji: React.FC<FormInputGajiProps> = ({ onSuccess, onCancel }) => { // Force re-evaluation
  const [period, setPeriod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}$/.test(period)) {
      alert('Format periode harus YYYY-MM');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await runPayroll(period);
      alert('Penggajian berhasil digenerate!');
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
            <Input
            id="period"
            label="Periode (YYYY-MM)"
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Contoh: 2025-11"
            required
            className="mt-1"
            />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Generate'}
            </Button>
        </div>
        </form>
    </div>
  );
};

export default FormInputGaji;
