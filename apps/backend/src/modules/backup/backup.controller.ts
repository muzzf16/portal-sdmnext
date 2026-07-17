
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

export const restoreFromUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No backup file uploaded' });
      return;
    }
    const result = await service.restoreFromUploadedFile(file.path);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const download = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const filePath = service.getBackupFilePath(filename as string);
    res.download(filePath);
  } catch (error) {
    next(error);
  }
};
