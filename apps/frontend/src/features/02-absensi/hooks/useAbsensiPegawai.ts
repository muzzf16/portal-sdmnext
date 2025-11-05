import { useState, useEffect, useCallback } from 'react';
import { getAbsensiByEmployeeId } from '../api/absensiApi';
import { Absensi } from '../types';

export const useAbsensiPegawai = (id: string) => {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAbsensi = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAbsensiByEmployeeId(id);
      setAbsensi(data);
    } catch (err) {
      setError(err as Error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAbsensi();
  }, [fetchAbsensi]);

  return { absensi, loading, error, refetch: fetchAbsensi };
};
