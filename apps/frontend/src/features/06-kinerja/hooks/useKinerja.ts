import { useState, useEffect } from 'react';
import { getPenilaianKinerjaById } from '../api/kinerjaApi';
import { Kinerja } from '../types';

export const useKinerja = (id: string) => {
  const [kinerja, setKinerja] = useState<Kinerja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchKinerja = async () => {
      try {
        const { data } = await getPenilaianKinerjaById(id);
        setKinerja(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchKinerja();
  }, [id]);

  return { kinerja, loading, error };
};
