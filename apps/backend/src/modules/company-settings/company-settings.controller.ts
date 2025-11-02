
import { Request, Response, NextFunction } from 'express';
import * as service from './company-settings.service';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await service.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settingsData = req.body;
    if (req.file) {
      settingsData.logo = `/logos/${req.file.filename}`;
    }
    await service.updateSettings(settingsData);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
