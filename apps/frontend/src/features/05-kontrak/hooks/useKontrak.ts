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
        const response = await getKontrakById(id);
        // Handle both response formats: { data: {...} } or { success: true, data: {...} }
        let contract: Kontrak | null = null;
        if (response.data) {
          if (response.data.id) {
            contract = response.data;
          } else if (response.data.data && response.data.data.id) {
            contract = response.data.data;
          }
        }
        setKontrak(contract);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchKontrak();
  }, [id]);

  return { kontrak, loading, error };
};
