import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  // Only log full stack trace for server errors (5xx)
  // Client errors (4xx) just log the message to reduce console noise
  if (status >= 500) {
    console.error(err && err.stack ? err.stack : err);
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(`[${status}] ${req.method} ${req.path}: ${err?.message || err}`);
  }

  res.status(status).json({
    success: false,
    message: err?.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err?.stack })
  });
};

export default errorHandler;