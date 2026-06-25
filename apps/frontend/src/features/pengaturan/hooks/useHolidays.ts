import { useState, useEffect, useCallback } from 'react';
import { getHolidays, createHoliday, updateHoliday, deleteHoliday, HolidayData } from '@/shared/services/holidays.service';

export const useHolidays = () => {
  const [holidays, setHolidays] = useState<HolidayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getHolidays();
      if (response.success) {
        setHolidays(response.data);
      } else {
        setError(response.message || 'Gagal memuat data libur');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const addHoliday = async (data: Omit<HolidayData, 'id'>) => {
    try {
      const response = await createHoliday(data);
      if (response.success) {
        await fetchHolidays();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const editHoliday = async (id: string, data: Omit<HolidayData, 'id'>) => {
    try {
      const response = await updateHoliday(id, data);
      if (response.success) {
        await fetchHolidays();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const removeHoliday = async (id: string) => {
    try {
      const response = await deleteHoliday(id);
      if (response.success) {
        await fetchHolidays();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return {
    holidays,
    loading,
    error,
    addHoliday,
    editHoliday,
    removeHoliday,
    refetch: fetchHolidays
  };
};
