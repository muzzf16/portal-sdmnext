import { useState, useEffect } from 'react';
import { getPelatihan, getPelatihanByEmployeeId } from '../api/pelatihanApi';
import { Pelatihan } from '../../../shared/types/types';
import { useAuth } from '@/shared/contexts/AuthContext';

export const usePelatihan = () => {
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchPelatihan = async () => {
    try {
      let response;
      if (user?.role === 'employee' && user.employeeId) {
        // For employee, fetch only their own training
        const employeeId = user.employeeId;
        if (!employeeId) return;
        response = await getPelatihanByEmployeeId(employeeId.toString());
      } else {
        // For admin, fetch all training
        response = await getPelatihan();
      }
      
      // Map the response to use English field names expected in this module
      const mappedData = (response.data || []).map((item: any) => ({
        id: Number(item.id),
        pegawai_id: String(item.pegawai_id || item.employeeId),
        nama_pelatihan: item.nama_pelatihan || item.trainingName,
        penyelenggara: item.penyelenggara || item.organizer,
        tanggal_mulai: item.tanggal_mulai || item.startDate,
        tanggal_selesai: item.tanggal_selesai || item.endDate,
        nomor_sertifikat: item.nomor_sertifikat || item.certificate,
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
