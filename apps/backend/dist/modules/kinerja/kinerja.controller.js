"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kinerja_service_1 = __importDefault(require("./kinerja.service"));
class KinerjaController {
    static async getAllPenilaianKinerja(req, res, next) {
        try {
            const performanceReviews = await kinerja_service_1.default.getAllPenilaianKinerja();
            res.status(200).json({ success: true, data: performanceReviews });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPenilaianKinerjaById(req, res, next) {
        try {
            const { id } = req.params;
            const performanceReview = await kinerja_service_1.default.getPenilaianKinerjaById(id);
            res.status(200).json({ success: true, data: performanceReview });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPenilaianKinerjaByEmployeeId(req, res, next) {
        try {
            const { id } = req.params;
            const performanceReviews = await kinerja_service_1.default.getPenilaianKinerjaByEmployeeId(id);
            res.status(200).json({ success: true, data: performanceReviews });
        }
        catch (error) {
            next(error);
        }
    }
    static async createPenilaianKinerja(req, res, next) {
        try {
            const performanceData = req.body;
            const newReview = await kinerja_service_1.default.createPenilaianKinerja(performanceData);
            res.status(201).json({ success: true, data: newReview });
        }
        catch (error) {
            console.error("createPenilaianKinerja Error:", error);
            next(error);
        }
    }
    static async updatePenilaianKinerja(req, res, next) {
        try {
            const { id } = req.params;
            const performanceData = req.body;
            const updatedReview = await kinerja_service_1.default.updatePenilaianKinerja(id, performanceData);
            res.status(200).json({ success: true, data: updatedReview });
        }
        catch (error) {
            next(error);
        }
    }
    static async addFeedbackKinerja(req, res, next) {
        try {
            const { id } = req.params;
            const feedback = req.body.employeeFeedback || req.body.feedback;
            if (!feedback) {
                return res.status(400).json({ success: false, message: 'employeeFeedback is required' });
            }
            const result = await kinerja_service_1.default.addFeedbackKinerja(id, feedback);
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            return next(error);
        }
    }
    static async deletePenilaianKinerja(req, res, next) {
        try {
            const { id } = req.params;
            const result = await kinerja_service_1.default.deletePenilaianKinerja(id);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = KinerjaController;
//# sourceMappingURL=kinerja.controller.js.map