import { useState, useEffect } from 'react';
import { getLamaran } from '../api/perekrutanApi';
import { Lamaran } from '../types';

export const useDaftarLamaran = () => {
  const [daftarLamaran, setDaftarLamaran] = useState<Lamaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLamaran = async () => {
      try {
        const { data } = await getLamaran();
        setDaftarLamaran(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchLamaran();
  }, []);

  return { daftarLamaran, loading, error, setDaftarLamaran };
};
