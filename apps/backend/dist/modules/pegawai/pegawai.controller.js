"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_service_1 = __importDefault(require("./pegawai.service"));
const errors_1 = require("../../utils/errors");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/avatars';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
class PegawaiController {
    static async getAllPegawai(req, res, next) {
        try {
            const pegawai = await pegawai_service_1.default.getAllPegawai();
            res.status(200).json(pegawai);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPegawaiById(req, res, next) {
        try {
            const { id } = req.params;
            const pegawai = await pegawai_service_1.default.getPegawaiById(id);
            res.status(200).json(pegawai);
        }
        catch (error) {
            next(error);
        }
    }
    static async createPegawai(req, res, next) {
        try {
            let avatarUrl = req.body.avatarUrl;
            if (req.file) {
                avatarUrl = `/uploads/avatars/${req.file.filename}`;
            }
            const { name, email, ...pegawaiData } = req.body;
            if (pegawaiData.educationHistory && typeof pegawaiData.educationHistory === 'string') {
                try {
                    pegawaiData.educationHistory = JSON.parse(pegawaiData.educationHistory);
                }
                catch (e) {
                    return next(new errors_1.AppError('Invalid educationHistory JSON format.', 400));
                }
            }
            const newPegawaiData = {
                ...pegawaiData,
                avatarUrl: avatarUrl || '/avatars/default-avatar.jpg'
            };
            const newPegawai = await pegawai_service_1.default.createPegawai(name, email, newPegawaiData);
            res.status(201).json(newPegawai);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePegawai(req, res, next) {
        try {
            let avatarUrl = req.body.avatarUrl;
            if (req.file) {
                avatarUrl = `/uploads/avatars/${req.file.filename}`;
            }
            const { id } = req.params;
            const { name, email, ...pegawaiData } = req.body;
            if (pegawaiData.educationHistory && typeof pegawaiData.educationHistory === 'string') {
                try {
                    pegawaiData.educationHistory = JSON.parse(pegawaiData.educationHistory);
                }
                catch (e) {
                    return next(new errors_1.AppError('Invalid educationHistory JSON format.', 400));
                }
            }
            const updatedPegawaiData = {
                ...pegawaiData
            };
            if (avatarUrl) {
                updatedPegawaiData.avatarUrl = avatarUrl;
            }
            const updatedPegawai = await pegawai_service_1.default.updatePegawai(id, name, email, updatedPegawaiData);
            res.status(200).json(updatedPegawai);
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePegawai(req, res, next) {
        try {
            const { id } = req.params;
            const result = await pegawai_service_1.default.deletePegawai(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePegawaiPayrollInfo(req, res, next) {
        try {
            const { id } = req.params;
            const payrollInfo = req.body;
            const result = await pegawai_service_1.default.updatePegawaiPayrollInfo(id, payrollInfo);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getGenderDistribution(req, res, next) {
        try {
            const distribution = await pegawai_service_1.default.getGenderDistribution();
            res.status(200).json(distribution);
        }
        catch (error) {
            next(error);
        }
    }
    static async getEducationDistribution(req, res, next) {
        try {
            const distribution = await pegawai_service_1.default.getEducationDistribution();
            res.status(200).json(distribution);
        }
        catch (error) {
            next(error);
        }
    }
}
PegawaiController.uploadAvatar = upload.single('photo');
exports.default = PegawaiController;
//# sourceMappingURL=pegawai.controller.js.map