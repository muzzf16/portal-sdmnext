import { useState, useEffect } from 'react';
import { getPelatihan } from '../api/pelatihanApi';
import { Pelatihan } from '../types';

export const usePelatihan = () => {
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPelatihan = async () => {
      try {
        const { data } = await getPelatihan();
        setPelatihan(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchPelatihan();
  }, []);

  return { pelatihan, loading, error };
};
