import { useLeaveRequests } from './useLeaveQuery';

export const useCuti = () => {
  const query = useLeaveRequests();

  return {
    cuti: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch
  };
};
