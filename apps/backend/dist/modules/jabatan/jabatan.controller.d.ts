import { Request, Response, NextFunction } from 'express';
declare class JabatanController {
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getByLevel(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getTree(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getTreeWithEmployees(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static getSubordinates(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
export default JabatanController;
//# sourceMappingURL=jabatan.controller.d.ts.map