import { useState, useEffect } from 'react';
import { getPelatihan } from '../api/pelatihanApi';
import { Pelatihan } from '../types';

export const usePelatihan = () => {
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPelatihan = async () => {
      try {
        const response = await getPelatihan();
        // Map the response to use English field names expected in this module
        const mappedData = (response.data || []).map(item => ({
          id: Number(item.id) || Number(item.id),
          employeeId: Number(item.pegawai_id) || Number(item.employeeId),
          trainingName: item.nama_pelatihan || item.trainingName,
          organizer: item.penyelenggara || item.organizer,
          startDate: item.tanggal_mulai || item.startDate,
          endDate: item.tanggal_selesai || item.endDate,
          certificate: item.nomor_sertifikat || item.certificate,
        } as Pelatihan));
        setPelatihan(mappedData);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchPelatihan();
  }, []);

  return { pelatihan, loading, error };
};
