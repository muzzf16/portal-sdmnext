import { Request, Response, NextFunction } from 'express';
import LaporanKepatuhanService from './laporan-kepatuhan.service';

interface AuthRequest extends Request {
    user?: any;
}

export default class LaporanKepatuhanController {
    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await LaporanKepatuhanService.create(req.body);
            return res.status(201).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const status = req.query.status as any;
            const employee_id = req.query.employee_id as string;
            
            const userRole = req.user?.role;
            const userEmployeeId = req.user?.employeeId || req.user?.userId;

            if (userRole === 'employee') {
                if (employee_id && String(employee_id) !== String(userEmployeeId)) {
                    return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke data pegawai ini' });
                }
                if (!employee_id) {
                    const data = await LaporanKepatuhanService.getByEmployeeId(userEmployeeId, status);
                    return res.status(200).json({ success: true, data });
                }
            }

            const data = await LaporanKepatuhanService.getAll(status, employee_id);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await LaporanKepatuhanService.getById(Number(req.params.id));
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getMyReports(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employeeId = req.user?.employeeId || req.user?.userId;
            const status = req.query.status as any;
            
            if (!employeeId) {
                return res.status(400).json({ success: false, message: 'User is not an employee' });
            }

            const data = await LaporanKepatuhanService.getByEmployeeId(employeeId, status);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async downloadTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const xlsx = require('xlsx');
            const wb = xlsx.utils.book_new();
            
            const headers = [
                'nama_laporan',
                'batas_akhir',
                'ketentuan',
                'periode',
                'tata_cara',
                'bagian'
            ];
            
            const ws = xlsx.utils.aoa_to_sheet([
                headers,
                ['Laporan Triwulanan', '2026-12-31', 'Sesuai regulasi OJK', 'Triwulanan', 'Upload PDF via portal', 'Divisi Kepatuhan']
            ]);
            
            xlsx.utils.book_append_sheet(wb, ws, 'Template');
            
            const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=template_laporan_kepatuhan.xlsx');
            return res.status(200).send(buffer);
        } catch (error) {
            return next(error);
        }
    }

    static async importExcel(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
            }
            
            const xlsx = require('xlsx');
            const workbook = xlsx.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const data: any[] = xlsx.utils.sheet_to_json(worksheet);
            
            let imported = 0;
            
            for (const row of data) {
                if (row.nama_laporan && row.batas_akhir) {
                    await LaporanKepatuhanService.create({
                        nama_laporan: row.nama_laporan,
                        batas_akhir: String(row.batas_akhir),
                        ketentuan: row.ketentuan || undefined,
                        periode: row.periode || undefined,
                        tata_cara: row.tata_cara || undefined,
                        bagian: row.bagian || undefined
                    });
                    imported++;
                }
            }
            
            const fs = require('fs');
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            return res.status(200).json({ success: true, imported });
        } catch (error) {
            if (req.file) {
                const fs = require('fs');
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            }
            return next(error);
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const updateData = { ...req.body };
            
            if (req.file) {
                // Return path relative to the public directory
                updateData.lampiran = `/documents/${req.file.filename}`;
            }

            const data = await LaporanKepatuhanService.update(Number(req.params.id), updateData);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await LaporanKepatuhanService.delete(Number(req.params.id));
            return res.status(200).json({ success: true, message: 'Laporan kepatuhan deleted successfully' });
        } catch (error) {
            return next(error);
        }
    }
}
