export class NotFoundError extends Error {
  statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends Error {
  statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ForbiddenError extends Error {
  statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.statusCode = 403;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CustomError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Alias for compatibility
export { CustomError as AppError };