import { useMyLeaveRequests } from './useLeaveQuery';

export const useCutiSaya = () => {
  const query = useMyLeaveRequests();

  return {
    cuti: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch
  };
};
