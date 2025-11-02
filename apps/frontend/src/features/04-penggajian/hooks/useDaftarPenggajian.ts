import { useState, useEffect, useCallback } from 'react';
import { getPenggajian } from '../api/penggajianApi';
import { Penggajian } from '../types';

export const useDaftarPenggajian = () => {
  const [daftarPenggajian, setDaftarPenggajian] = useState<Penggajian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPenggajian = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getPenggajian();
      setDaftarPenggajian(data);
    } catch (err) {
      setError(err as Error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPenggajian();
  }, [fetchPenggajian]);

  return { daftarPenggajian, loading, error, fetchPenggajian };
};
