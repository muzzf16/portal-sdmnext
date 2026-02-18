"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const activity_library_service_1 = __importDefault(require("./activity-library.service"));
class ActivityLibraryController {
    static async getAll(req, res, next) {
        try {
            const { position, department, category } = req.query;
            const filters = {
                position: position,
                department: department,
                category: category,
            };
            const data = await activity_library_service_1.default.getAll(filters);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getByPosition(req, res, next) {
        try {
            const { position } = req.params;
            const data = await activity_library_service_1.default.getByPosition(position);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const data = await activity_library_service_1.default.getById(id);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPositions(req, res, next) {
        try {
            const data = await activity_library_service_1.default.getPositions();
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await activity_library_service_1.default.create(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = await activity_library_service_1.default.update(id, req.body);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const data = await activity_library_service_1.default.delete(id);
            res.status(200).json({ success: true, ...data });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = ActivityLibraryController;
//# sourceMappingURL=activity-library.controller.js.map