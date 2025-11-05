import React, { useState } from 'react';
import { clockIn, clockOut } from '../api/absensiApi';

interface CatatWaktuProps {
  employeeId: string;
  employeeName: string;
}

const CatatWaktu: React.FC<CatatWaktuProps> = ({ employeeId, employeeName }) => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await clockIn(employeeId, employeeName);
      setIsClockedIn(true);
    } catch (error) {
      // Handle error
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await clockOut(employeeId);
      setIsClockedIn(false);
    } catch (error) {
      // Handle error
    }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      {
        isClockedIn ? (
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
