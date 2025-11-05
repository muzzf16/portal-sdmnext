import { useState, useEffect, useCallback } from 'react';
import { getPenggajian } from '../api/penggajianApi';
import { Penggajian } from '../types';

export const useDaftarPenggajian = (searchTerm: string, filterPeriod: string) => {
  const [daftarPenggajian, setDaftarPenggajian] = useState<Penggajian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPenggajian = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getPenggajian({ search: searchTerm, period: filterPeriod });
      setDaftarPenggajian(data);
    } catch (err) {
      setError(err as Error);
    }
    setLoading(false);
  }, [searchTerm, filterPeriod]);

  useEffect(() => {
    fetchPenggajian();
  }, [fetchPenggajian]);

  return { daftarPenggajian, loading, error, fetchPenggajian };
};
