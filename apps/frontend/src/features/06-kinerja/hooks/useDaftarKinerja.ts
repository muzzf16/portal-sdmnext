import { useState, useEffect, useCallback } from 'react';
import { getPenilaianKinerja } from '../api/kinerjaApi';
import { Kinerja } from '../types';

export const useDaftarKinerja = () => {
  const [daftarKinerja, setDaftarKinerja] = useState<Kinerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    const fetchKinerja = async () => {
      setLoading(true);
      try {
        const { data } = await getPenilaianKinerja();
        setDaftarKinerja(data.data || []);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchKinerja();
  }, [refreshKey]);

  return { daftarKinerja, loading, error, setDaftarKinerja, refetch };
};
