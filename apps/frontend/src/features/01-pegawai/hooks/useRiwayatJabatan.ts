// src/features/01-pegawai/hooks/useRiwayatJabatan.ts
import { useState, useEffect } from 'react';
import { getRiwayatJabatan } from '../../../shared/services/kontrakAPI';
import { RiwayatJabatan } from '../types';

export const useRiwayatJabatan = (employeeId: string) => {
  const [riwayatJabatan, setRiwayatJabatan] = useState<RiwayatJabatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRiwayatJabatan = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await getRiwayatJabatan(employeeId);
        setRiwayatJabatan(response.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayatJabatan();
  }, [employeeId]);

  return { riwayatJabatan, loading, error };
};