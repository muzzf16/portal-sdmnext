
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

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listBackups();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const restore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.body;
    const result = await service.restoreDatabase(filename);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
