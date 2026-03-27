import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePerformanceReviewList, PERFORMANCE_QUERY_KEYS } from './usePerformanceManagementQuery';
import { Kinerja } from '../types';

export const useDaftarKinerja = () => {
  const queryClient = useQueryClient();
  const reviewListQuery = usePerformanceReviewList();
  const daftarKinerja = (reviewListQuery.data ?? []) as Kinerja[];

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.performanceReview.all });
  }, [queryClient]);

  return {
    daftarKinerja,
    loading: reviewListQuery.isLoading,
    error: (reviewListQuery.error as Error | null) ?? null,
    setDaftarKinerja: () => undefined,
    refetch
  };
};
