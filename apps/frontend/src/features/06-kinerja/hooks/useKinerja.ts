import { usePerformanceReview } from './usePerformanceManagementQuery';

export const useKinerja = (id: string) => {
  const reviewQuery = usePerformanceReview(id);

  return {
    kinerja: reviewQuery.data ?? null,
    loading: reviewQuery.isLoading,
    error: (reviewQuery.error as Error | null) ?? null
  };
};
