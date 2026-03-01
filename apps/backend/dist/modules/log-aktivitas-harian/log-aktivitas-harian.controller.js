"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_aktivitas_harian_service_1 = __importDefault(require("./log-aktivitas-harian.service"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/documents';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'doc-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
class LogAktivitasHarianController {
    static async createLog(req, res, next) {
        try {
            const id_pegawai = req.user?.employeeId || req.user?.id || req.body.id_pegawai;
            const data = await log_aktivitas_harian_service_1.default.createLog({
                id_pegawai: Number(id_pegawai),
                tanggal: req.body.tanggal,
                id_activity_library: Number(req.body.id_activity_library),
                frekuensi: Number(req.body.frekuensi || 1),
                catatan: req.body.catatan
            });
            return res.status(201).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async createBulkLog(req, res, next) {
        try {
            const id_pegawai = req.user?.employeeId || req.user?.id || req.body.id_pegawai;
            const { tanggal } = req.body;
            let logs = req.body.logs;
            if (typeof logs === 'string') {
                try {
                    logs = JSON.parse(logs);
                }
                catch (e) {
                    return res.status(400).json({ success: false, message: 'Invalid logs format' });
                }
            }
            if (!tanggal || !logs || !Array.isArray(logs)) {
                return res.status(400).json({ success: false, message: 'tanggal and logs array are required' });
            }
            if (req.files && Array.isArray(req.files)) {
                logs.forEach((log) => {
                    const file = req.files.find(f => f.fieldname === `file_${log.id_activity_library}`);
                    if (file) {
                        log.lampiran = `/uploads/documents/${file.filename}`;
                    }
                });
            }
            const data = await log_aktivitas_harian_service_1.default.createBulkLogs(id_pegawai, tanggal, logs);
            return res.status(201).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getMyLogs(req, res, next) {
        try {
            const id_pegawai = req.user?.employeeId || req.user?.id || req.query.id_pegawai;
            const tanggal = req.query.tanggal;
            if (!id_pegawai || !tanggal) {
                return res.status(400).json({ success: false, message: 'id_pegawai and tanggal are required' });
            }
            const data = await log_aktivitas_harian_service_1.default.getMyLogs(id_pegawai, tanggal);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getSummary(req, res, next) {
        try {
            const id_pegawai = req.user?.employeeId || req.user?.id || req.query.id_pegawai;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            if (!id_pegawai || !startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'id_pegawai, startDate, and endDate are required' });
            }
            const data = await log_aktivitas_harian_service_1.default.getSummary(id_pegawai, startDate, endDate);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getAdminLogs(req, res, next) {
        try {
            const tanggal = req.query.tanggal;
            const id_pegawai = req.query.id_pegawai;
            if (!tanggal || !id_pegawai) {
                return res.status(400).json({ success: false, message: 'tanggal and id_pegawai are required' });
            }
            const data = await log_aktivitas_harian_service_1.default.getMyLogs(id_pegawai, tanggal);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getAdminSummary(req, res, next) {
        try {
            const tanggal = req.query.tanggal;
            if (!tanggal) {
                return res.status(400).json({ success: false, message: 'tanggal is required' });
            }
            const data = await log_aktivitas_harian_service_1.default.getAdminSummaryByDate(tanggal);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const id_log = req.params.id;
            const { status } = req.body;
            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }
            const data = await log_aktivitas_harian_service_1.default.updateStatus(Number(id_log), status);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
}
LogAktivitasHarianController.uploadAny = upload.any();
exports.default = LogAktivitasHarianController;
//# sourceMappingURL=log-aktivitas-harian.controller.js.map