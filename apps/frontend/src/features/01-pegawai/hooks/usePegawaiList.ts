import { useState, useEffect, useCallback } from 'react';
import { getPegawai } from '../api/employeeApi';
import { Pegawai } from '../types';

export const usePegawaiList = () => {
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPegawai = useCallback(async () => {
    try {
      const response = await getPegawai();
      // Handle both standardized and raw response formats
      if (response && typeof response === 'object' && 'data' in response) {
        // Response is in standardized format
        setPegawai(response.data);
      } else {
        // Response is raw data (shouldn't happen with our new API functions, but as a fallback)
        setPegawai(response as Pegawai[]);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

  return { pegawai, loading, error, setPegawai, fetchPegawai };
};