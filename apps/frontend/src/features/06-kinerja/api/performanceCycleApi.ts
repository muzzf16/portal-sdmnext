import api from '../../../shared/services/api';
import type { PerformanceCycleBatchPayload, PerformanceCycleBatchResult } from '../types';

const postBatchAction = (path: string, payload: PerformanceCycleBatchPayload) =>
  api.post<{ success: boolean; data: PerformanceCycleBatchResult }>(path, payload);

export const openPerformancePeriod = (payload: PerformanceCycleBatchPayload) =>
  postBatchAction('/performance-cycle/open', payload);

export const syncPerformanceCycleKpi = (payload: PerformanceCycleBatchPayload) =>
  postBatchAction('/performance-cycle/sync-kpi', payload);

export const createPerformanceCycleReviews = (payload: PerformanceCycleBatchPayload) =>
  postBatchAction('/performance-cycle/create-reviews', payload);

export const finalizePerformanceCycle = (payload: PerformanceCycleBatchPayload) =>
  postBatchAction('/performance-cycle/finalize', payload);
