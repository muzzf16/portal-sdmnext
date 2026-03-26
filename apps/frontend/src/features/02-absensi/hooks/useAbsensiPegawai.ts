import { useAttendanceByEmployee } from './useAttendanceQuery';

export const useAbsensiPegawai = (id: string) => {
  const query = useAttendanceByEmployee(id || undefined);

  return {
    absensi: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch
  };
};
