import { useState, useEffect } from 'react';
import { getPegawaiById } from '../api/employeeApi';
import { Pegawai } from '../types';

const VITE_API_URL = 'http://localhost:3333';

const constructAvatarUrl = (pegawaiData: Pegawai): Pegawai => {
  if (pegawaiData && pegawaiData.avatarUrl) {
    if (!pegawaiData.avatarUrl.startsWith('http')) {
      return {
        ...pegawaiData,
        avatarUrl: `${VITE_API_URL}${pegawaiData.avatarUrl}`
      };
    }
  }
  return pegawaiData;
};

export const usePegawai = (id: string) => {
  const [pegawai, setPegawai] = useState<Pegawai | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPegawai = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const response = await getPegawaiById(id);
        let pegawaiData: Pegawai;

        if (response && typeof response === 'object' && 'data' in response) {
          pegawaiData = response.data;
        } else {
          pegawaiData = response as Pegawai;
        }
        
        const pegawaiWithFullAvatarUrl = constructAvatarUrl(pegawaiData);
        setPegawai(pegawaiWithFullAvatarUrl);

      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchPegawai();
  }, [id]);

  return { pegawai, loading, error };
};