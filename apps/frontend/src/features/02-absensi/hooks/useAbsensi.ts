import { useState, useEffect } from 'react';
import { getAbsensi } from '../api/absensiApi';
import { Absensi } from '../types';

export const useAbsensi = () => {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        const { data } = await getAbsensi();
        setAbsensi(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchAbsensi();
  }, []);

  return { absensi, loading, error, setAbsensi };
};
