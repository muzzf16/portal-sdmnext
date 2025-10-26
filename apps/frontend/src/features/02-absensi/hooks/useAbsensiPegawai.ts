import { useState, useEffect } from 'react';
import { getAbsensiByEmployeeId } from '../api/absensiApi';
import { Absensi } from '../types';

export const useAbsensiPegawai = (id: string) => {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        const { data } = await getAbsensiByEmployeeId(id);
        setAbsensi(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchAbsensi();
  }, [id]);

  return { absensi, loading, error };
};
