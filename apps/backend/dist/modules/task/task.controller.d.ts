import { Request, Response, NextFunction } from 'express';
export declare const TaskController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBySupervisor(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByEmployee(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=task.controller.d.ts.map