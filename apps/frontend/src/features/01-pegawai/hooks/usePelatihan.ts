// src/features/01-pegawai/hooks/usePelatihan.ts
import { useState, useEffect } from 'react';
import { getPelatihan } from '../../../shared/services/pelatihanAPI';
import { Pelatihan } from '../types';

export const usePelatihan = (employeeId: string) => {
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPelatihan = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await getPelatihan(employeeId);
        setPelatihan(response.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPelatihan();
  }, [employeeId]);

  return { pelatihan, loading, error };
};