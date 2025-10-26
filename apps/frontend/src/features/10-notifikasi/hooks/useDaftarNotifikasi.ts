import { useState, useEffect } from 'react';
import { getNotifikasiByEmployeeId, tandaiNotifikasiSudahDibaca } from '../api/notifikasiApi';
import { Notifikasi } from '../types';

export const useDaftarNotifikasi = (employeeId: string) => {
  const [daftarNotifikasi, setDaftarNotifikasi] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNotifikasi = async () => {
      try {
        setLoading(true);
        const response = await getNotifikasiByEmployeeId(employeeId);
        setDaftarNotifikasi(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifikasi();
  }, [employeeId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await tandaiNotifikasiSudahDibaca(notificationId);
      setDaftarNotifikasi((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      setError(err as Error);
    }
  };

  return { daftarNotifikasi, loading, error, markAsRead };
};