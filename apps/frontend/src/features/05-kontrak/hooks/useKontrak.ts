import { useState, useEffect } from 'react';
import { getKontrakById } from '../api/kontrakApi';
import { Kontrak } from '../types';

export const useKontrak = (id: string) => {
  const [kontrak, setKontrak] = useState<Kontrak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchKontrak = async () => {
      try {
        const { data } = await getKontrakById(id);
        setKontrak(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchKontrak();
  }, [id]);

  return { kontrak, loading, error };
};
