import { Request, Response, NextFunction } from 'express';
import ChangelogService from './changelog.service';

export default class ChangelogController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ChangelogService.create({
        release_tag: req.body.release_tag,
        module: req.body.module,
        type: req.body.type,
        description: req.body.description,
        impacted_files: Array.isArray(req.body.impacted_files) ? req.body.impacted_files : []
      }, req.context?.userId || 'system', req.context?.requestId);

      return res.status(201).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ChangelogService.list(
        req.query.limit ? Number(req.query.limit) : undefined
      );

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }
}
