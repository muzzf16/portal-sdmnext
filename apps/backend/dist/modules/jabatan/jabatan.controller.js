"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jabatan_service_1 = __importDefault(require("./jabatan.service"));
class JabatanController {
    static async getAll(req, res, next) {
        try {
            const jabatan = await jabatan_service_1.default.getAll();
            return res.status(200).json({ success: true, data: jabatan });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const jabatan = await jabatan_service_1.default.getById(id);
            return res.status(200).json({ success: true, data: jabatan });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getByLevel(req, res, next) {
        try {
            const level = parseInt(req.params.level);
            const jabatan = await jabatan_service_1.default.getByLevel(level);
            return res.status(200).json({ success: true, data: jabatan });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getTree(req, res, next) {
        try {
            const tree = await jabatan_service_1.default.getTree();
            return res.status(200).json({ success: true, data: tree });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getTreeWithEmployees(req, res, next) {
        try {
            const tree = await jabatan_service_1.default.getTreeWithEmployees();
            return res.status(200).json({ success: true, data: tree });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getSubordinates(req, res, next) {
        try {
            const { pegawaiId } = req.params;
            const recursive = req.query.recursive === 'true';
            const subordinates = recursive
                ? await jabatan_service_1.default.getAllSubordinates(pegawaiId)
                : await jabatan_service_1.default.getSubordinates(pegawaiId);
            return res.status(200).json({ success: true, data: subordinates });
        }
        catch (error) {
            return next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const jabatan = await jabatan_service_1.default.create(req.body);
            return res.status(201).json({ success: true, data: jabatan });
        }
        catch (error) {
            return next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const jabatan = await jabatan_service_1.default.update(id, req.body);
            return res.status(200).json({ success: true, data: jabatan });
        }
        catch (error) {
            return next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const result = await jabatan_service_1.default.delete(id);
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            return next(error);
        }
    }
}
exports.default = JabatanController;
//# sourceMappingURL=jabatan.controller.js.map