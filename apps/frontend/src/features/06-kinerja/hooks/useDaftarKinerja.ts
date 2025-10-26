import { useState, useEffect } from 'react';
import { getPenilaianKinerja } from '../api/kinerjaApi';
import { Kinerja } from '../types';

export const useDaftarKinerja = () => {
  const [daftarKinerja, setDaftarKinerja] = useState<Kinerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchKinerja = async () => {
      try {
        const { data } = await getPenilaianKinerja();
        setDaftarKinerja(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchKinerja();
  }, []);

  return { daftarKinerja, loading, error, setDaftarKinerja };
};
