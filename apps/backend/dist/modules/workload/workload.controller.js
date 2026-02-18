"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const workload_service_1 = __importDefault(require("./workload.service"));
class WorkloadController {
    static async getAnalysis(req, res, next) {
        try {
            const { employeeId } = req.params;
            const { year } = req.query;
            if (!year) {
                throw new Error('Year is required');
            }
            const analysis = await workload_service_1.default.getAnalysis(employeeId, parseInt(year));
            if (!analysis) {
                return res.status(200).json({ success: true, data: null });
            }
            const fte = workload_service_1.default.calculateFTE(analysis.totalYearlyMinutes || 0);
            return res.status(200).json({
                success: true,
                data: {
                    ...analysis,
                    ftePercentage: fte.ftePercentage,
                    fteStatus: fte.fteStatus,
                    hoursPerDay: fte.hoursPerDay
                }
            });
        }
        catch (error) {
            return next(error);
        }
    }
    static async saveAnalysis(req, res, next) {
        try {
            const data = req.body;
            const result = await workload_service_1.default.saveAnalysis(data);
            return res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            return next(error);
        }
    }
}
exports.default = WorkloadController;
//# sourceMappingURL=workload.controller.js.map