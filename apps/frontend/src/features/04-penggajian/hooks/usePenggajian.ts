import { useState, useEffect } from 'react';
import { getPenggajianById } from '../api/penggajianApi';
import { Penggajian } from '../types';

export const usePenggajian = (id: string) => {
  const [penggajian, setPenggajian] = useState<Penggajian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPenggajian = async () => {
      try {
        const { data } = await getPenggajianById(id);
        setPenggajian(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchPenggajian();
  }, [id]);

  return { penggajian, loading, error };
};
