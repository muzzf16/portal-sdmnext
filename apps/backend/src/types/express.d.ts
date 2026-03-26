export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        employeeId?: string;
        role?: string;
        [key: string]: unknown;
      };
      context?: {
        requestId: string;
        userId: string;
        role: string;
      };
    }
  }
}
