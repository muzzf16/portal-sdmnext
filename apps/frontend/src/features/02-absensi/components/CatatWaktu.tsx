import React, { useState } from 'react';
import { useClockInMutation, useClockOutMutation } from '../hooks/useAttendanceQuery';

interface CatatWaktuProps {
  employeeId: string;
  employeeName: string;
  hasActiveClockIn: boolean;
  onSuccess: () => void;
}

const CatatWaktu: React.FC<CatatWaktuProps> = ({ employeeId, employeeName, hasActiveClockIn, onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();
  const loading = clockInMutation.isPending || clockOutMutation.isPending;

  const handleClockIn = async () => {
    setError(null);
    try {
      await clockInMutation.mutateAsync({ employeeId, employeeName });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Gagal mencatat jam masuk');
    }
  };

  const handleClockOut = async () => {
    setError(null);
    try {
      await clockOutMutation.mutateAsync(employeeId);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Gagal mencatat jam keluar');
    }
  };

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {
        hasActiveClockIn ? (
          <button
            onClick={handleClockOut}
            disabled={loading}
            className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-opacity-80 disabled:bg-slate-400"
          >
            {loading ? 'Mencatat keluar...' : 'Catat Keluar'}
          </button>
        ) : (
          <button
            onClick={handleClockIn}
            disabled={loading}
            className="px-4 py-2 font-bold text-white bg-green-500 rounded-md hover:bg-opacity-80 disabled:bg-slate-400"
          >
            {loading ? 'Mencatat masuk...' : 'Catat Masuk'}
          </button>
        )
      }
    </div>
  );
};

export default CatatWaktu;
