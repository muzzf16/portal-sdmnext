import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import config from '../config/config';

const JWT_SECRET = config.jwtSecret;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded; // Add user info to request object
    return next();
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

export const restrictTo = (...roles: string[]): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // @ts-ignore
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
      return;
    }
    return next(); // Added return here
  };
};