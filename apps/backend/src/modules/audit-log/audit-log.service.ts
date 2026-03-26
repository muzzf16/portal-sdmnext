import { AuditLogRepository } from './audit-log.repository';
import { AuditLogEntry, AuditLogFilters } from './audit-log.model';

export default class AuditLogService {
  static async record(payload: AuditLogEntry) {
    return AuditLogRepository.create(payload);
  }

  static async list(filters: AuditLogFilters) {
    return AuditLogRepository.findAll(filters);
  }
}
