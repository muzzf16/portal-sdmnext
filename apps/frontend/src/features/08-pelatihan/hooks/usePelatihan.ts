import { useState, useEffect } from 'react';
import { getPelatihan, getPelatihanByEmployeeId } from '../api/pelatihanApi';
import { Pelatihan } from '../types';
import { useAuth } from '@/shared/contexts/AuthContext';

export const usePelatihan = () => {
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchPelatihan = async () => {
    try {
      let response;
      if (user?.role === 'employee') {
        // For employee, fetch only their own training
        response = await getPelatihanByEmployeeId(user.employeeId.toString());
      } else {
        // For admin, fetch all training
        response = await getPelatihan();
      }
      
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

  useEffect(() => {
    fetchPelatihan();
  }, [user]);

  const refetch = () => {
    setLoading(true);
    fetchPelatihan();
  };

  return { pelatihan, loading, error, refetch };
};
