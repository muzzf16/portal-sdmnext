import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestContextMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user;

  req.context = {
    requestId: crypto.randomUUID(),
    userId: user?.employeeId || user?.id || 'anonymous',
    role: user?.role || 'guest'
  };

  next();
};
