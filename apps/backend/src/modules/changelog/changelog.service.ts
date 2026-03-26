import AuditLogService from '../audit-log/audit-log.service';
import { ChangelogRepository } from './changelog.repository';
import { ChangelogEntry } from './changelog.model';

export default class ChangelogService {
  static async create(payload: ChangelogEntry, actorId = 'system', requestId?: string) {
    const data = await ChangelogRepository.create({
      ...payload,
      created_by: actorId
    });

    await AuditLogService.record({
      user_id: actorId,
      action: 'CREATE',
      module: 'changelog',
      description: `Create changelog entry for ${payload.module}`,
      metadata: {
        release_tag: payload.release_tag,
        type: payload.type
      },
      request_id: requestId
    });

    return data;
  }

  static async list(limit?: number) {
    return ChangelogRepository.findAll(limit);
  }
}
