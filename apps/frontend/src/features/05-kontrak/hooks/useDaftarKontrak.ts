import { useState, useEffect } from 'react';
import { getKontrak } from '../api/kontrakApi';
import { Kontrak } from '../types';

export const useDaftarKontrak = () => {
  const [daftarKontrak, setDaftarKontrak] = useState<Kontrak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchKontrak = async () => {
      try {
        const { data } = await getKontrak();
        if (Array.isArray(data)) {
          setDaftarKontrak(data);
        } else {
          setDaftarKontrak([]); // Set to empty array if data is not an array
        }
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchKontrak();
  }, []);

  return { daftarKontrak, loading, error, setDaftarKontrak };
};
