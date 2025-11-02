
import { Request, Response, NextFunction } from 'express';
import * as service from './backup.service';

export const backup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.backupDatabase();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const restore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.restoreDatabase();
    res.json(result);
  } catch (error) {
    next(error);
  }
};
