import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  // Log full error in non-production for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(err && err.stack ? err.stack : err);
  } else {
    // In production, log a concise message
    console.error(err && err.message ? err.message : err);
  }

  res.status(status).json({
    success: false,
    message: err?.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err?.stack })
  });
};

export default errorHandler;