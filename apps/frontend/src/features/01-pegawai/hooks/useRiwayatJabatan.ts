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
        const data = response?.data ?? [];
        // Normalize API shape to local RiwayatJabatan type (convert id to number)
        const normalized: RiwayatJabatan[] = Array.isArray(data)
          ? data.map((item: any) => ({ ...item, id: Number(item.id) }))
          : [];
        setRiwayatJabatan(normalized);
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