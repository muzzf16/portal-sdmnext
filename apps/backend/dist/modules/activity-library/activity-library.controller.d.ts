import { Request, Response, NextFunction } from 'express';
export default class ActivityLibraryController {
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getByPosition(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPositions(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=activity-library.controller.d.ts.map