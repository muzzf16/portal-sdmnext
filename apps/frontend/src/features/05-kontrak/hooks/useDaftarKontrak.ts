import { useState, useEffect, useCallback } from 'react';
import { getKontrak } from '../api/kontrakApi';
import { Kontrak } from '../types';

export const useDaftarKontrak = () => {
  const [daftarKontrak, setDaftarKontrak] = useState<Kontrak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchKontrak = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getKontrak();
      // Handle both response formats: { data: [...] } or { success: true, data: [...] }
      let contracts: Kontrak[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          contracts = response.data;
        } else if (typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as any).data)) {
          contracts = (response.data as any).data;
        }
      }
      setDaftarKontrak(contracts);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setDaftarKontrak([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKontrak();
  }, [fetchKontrak]);

  return { daftarKontrak, loading, error, refetch: fetchKontrak };
};
