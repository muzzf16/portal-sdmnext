import { useState, useEffect } from 'react';
import { getPermintaanCutiSaya } from '../api/cutiApi';
import { Cuti } from '../types';
import { useAuth } from '@/shared/contexts/AuthContext';

export const useCutiSaya = () => {
  const [cuti, setCuti] = useState<Cuti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCutiSaya = async () => {
      if (!user) {
        setError(new Error('User not authenticated'));
        setLoading(false);
        return;
      }
      
      try {
        const response = await getPermintaanCutiSaya(user.employeeId.toString());
        setCuti(response.data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchCutiSaya();
  }, [user]);

  return { cuti, loading, error, setCuti };
};