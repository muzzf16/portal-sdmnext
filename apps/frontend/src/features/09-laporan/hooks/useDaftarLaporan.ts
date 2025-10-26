import { useState, useEffect } from 'react';
import { getLaporan } from '../api/laporanApi';
import { Laporan } from '../types';

export const useDaftarLaporan = () => {
  const [daftarLaporan, setDaftarLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const { data } = await getLaporan();
        setDaftarLaporan(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchLaporan();
  }, []);

  return { daftarLaporan, loading, error, setDaftarLaporan };
};
