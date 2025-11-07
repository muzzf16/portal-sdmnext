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
        // Map the response to the local Pelatihan type to ensure consistent field names
        const mappedData = (response.data || []).map((item: any) => {
          // Handle both naming conventions (English and Indonesian)
          return {
            id: Number(item.id) || Number(item.id),
            pegawai_id: Number(item.pegawai_id) || Number(item.employeeId || item.pegawai_id || 0),
            nama_pelatihan: item.nama_pelatihan || item.trainingName || '',
            penyelenggara: item.penyelenggara || item.organizer || '',
            tanggal_mulai: item.tanggal_mulai || item.startDate || '',
            tanggal_selesai: item.tanggal_selesai || item.endDate || '',
            nomor_sertifikat: item.nomor_sertifikat || item.certificate,
            durasi: item.durasi,
            deskripsi: item.deskripsi,
          } as Pelatihan;
        });
        setPelatihan(mappedData);
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