import { useState, useEffect } from 'react';
import { getPenggajian } from '../api/penggajianApi';
import { Penggajian } from '../types';

export const useDaftarPenggajian = () => {
  const [daftarPenggajian, setDaftarPenggajian] = useState<Penggajian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPenggajian = async () => {
      try {
        const { data } = await getPenggajian();
        setDaftarPenggajian(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchPenggajian();
  }, []);

  return { daftarPenggajian, loading, error, setDaftarPenggajian };
};
