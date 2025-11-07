import { Request, Response, NextFunction } from 'express';
declare class AuthPenggunaController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default AuthPenggunaController;
//# sourceMappingURL=auth.pengguna.controller.d.ts.map