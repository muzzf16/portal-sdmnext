import { Request, Response, NextFunction } from 'express';
import AuditLogService from './audit-log.service';

export default class AuditLogController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = {
        user_id: req.body.user_id || req.context?.userId || 'system',
        action: req.body.action,
        module: req.body.module,
        description: req.body.description,
        metadata: req.body.metadata || {},
        request_id: req.context?.requestId
      };

      const data = await AuditLogService.record(payload);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuditLogService.list({
        module: req.query.module as string | undefined,
        action: req.query.action as string | undefined,
        userId: req.query.userId as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined
      });

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }
}
