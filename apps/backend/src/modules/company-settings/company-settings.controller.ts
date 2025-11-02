
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
    } else if (settingsData.logo && settingsData.logo.includes('http')) {
      try {
        const url = new URL(settingsData.logo);
        settingsData.logo = url.pathname;
      } catch (e) {
        console.error('Invalid URL for logo, skipping modification:', settingsData.logo);
      }
    }
    await service.updateSettings(settingsData);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
