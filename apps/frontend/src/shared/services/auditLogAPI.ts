import api from './api';

export interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  module: string;
  description: string;
  metadata: any;
  request_id?: string;
  device?: string;
  created_at: string;
}

export interface AuditLogFilters {
  module?: string;
  action?: string;
  userId?: string;
  device?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
}

export const auditLogAPI = {
  getAll: async (filters: AuditLogFilters = {}) => {
    const response = await api.get('/audit-logs', { params: filters });
    return response.data;
  },
};
