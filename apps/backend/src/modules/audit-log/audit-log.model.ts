export interface AuditLogEntry {
  id?: number;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT';
  module: string;
  description: string;
  metadata?: Record<string, unknown>;
  request_id?: string;
  created_at?: string;
}

export interface AuditLogFilters {
  module?: string;
  action?: string;
  userId?: string;
  limit?: number;
}
