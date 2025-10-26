import { useState, useEffect } from 'react';
import { getPermintaanCuti } from '../api/cutiApi';
import { Cuti } from '../types';

export const useCuti = () => {
  const [cuti, setCuti] = useState<Cuti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCuti = async () => {
      try {
        const { data } = await getPermintaanCuti();
        setCuti(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchCuti();
  }, []);

  return { cuti, loading, error, setCuti };
};
