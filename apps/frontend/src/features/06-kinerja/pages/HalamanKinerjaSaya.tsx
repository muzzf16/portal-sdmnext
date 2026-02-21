import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getPenilaianKinerjaByEmployeeId } from '../api/kinerjaApi';
import { Kinerja } from '../types';
import DetailKinerja from '../components/DetailKinerja';

const HalamanKinerjaSaya: React.FC = () => {
  const { user } = useAuth();
  const [latestPerformance, setLatestPerformance] = useState<Kinerja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!user || !user.employeeId) return;
      try {
        setLoading(true);
        const employeeId = user.employeeId;
        if (!employeeId) return;
        const response = await getPenilaianKinerjaByEmployeeId(employeeId);
        const kinerjaList = response.data.data;
        if (kinerjaList && kinerjaList.length > 0) {
          // Assuming the API returns reviews sorted by date, otherwise sort here
          setLatestPerformance(kinerjaList[0]);
        }
        setLoading(false);
      } catch (err) {
        setError('Gagal memuat data kinerja');
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [user]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-primary-dark-blue mb-6">Kinerja Saya</h1>
      {loading && <p>Memuat...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {latestPerformance ? (
        <DetailKinerja performanceId={latestPerformance.id} />
      ) : (
        !loading && <p>Belum ada penilaian kinerja.</p>
      )}
    </div>
  );
};

export default HalamanKinerjaSaya;
