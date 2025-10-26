import { useState, useEffect } from 'react';
import { getPegawaiById } from '../api/employeeApi';
import { Pegawai } from '../types';

export const usePegawai = (id: string) => {
  const [pegawai, setPegawai] = useState<Pegawai | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPegawai = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const response = await getPegawaiById(id);
        // Handle both standardized and raw response formats
        if (response && typeof response === 'object' && 'data' in response) {
          // Response is in standardized format
          setPegawai(response.data);
        } else {
          // Response is raw data (shouldn't happen with our new API functions, but as a fallback)
          setPegawai(response as Pegawai);
        }
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchPegawai();
  }, [id]);

  return { pegawai, loading, error };
};
