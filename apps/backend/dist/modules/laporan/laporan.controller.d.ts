import { Request, Response, NextFunction } from 'express';
declare class LaporanController {
    static getLaporanPegawai(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getLaporanAbsensi(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getLaporanPenggajian(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getLaporanCuti(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getLaporanKinerja(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default LaporanController;
//# sourceMappingURL=laporan.controller.d.ts.map