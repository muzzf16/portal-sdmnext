import { useAttendanceRecords } from './useAttendanceQuery';

export const useAbsensi = () => {
  const query = useAttendanceRecords();

  return {
    absensi: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch
  };
};
