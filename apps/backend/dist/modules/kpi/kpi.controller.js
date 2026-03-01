"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kpi_service_1 = __importDefault(require("./kpi.service"));
class KpiController {
    static async getAll(req, res, next) {
        try {
            const { employeeId, period, status } = req.query;
            const filters = {
                employeeId: employeeId,
                period: period,
                status: status,
            };
            const data = await kpi_service_1.default.getAll(filters);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getByEmployeeId(req, res, next) {
        try {
            const { employeeId } = req.params;
            const data = await kpi_service_1.default.getByEmployeeId(employeeId);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getByEmployeePeriod(req, res, next) {
        try {
            const { employeeId } = req.params;
            const { period } = req.query;
            const data = await kpi_service_1.default.getByEmployeePeriod(employeeId, period);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const data = await kpi_service_1.default.getById(id);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await kpi_service_1.default.create(req.body);
            return res.status(201).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = await kpi_service_1.default.update(id, req.body);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async updateActualValue(req, res, next) {
        try {
            const { id } = req.params;
            const { actualValue } = req.body;
            if (actualValue === undefined) {
                return res.status(400).json({ success: false, message: 'actualValue is required' });
            }
            const evidenceUrl = req.file
                ? `/documents/${req.file.filename}`
                : (req.body.evidenceUrl || undefined);
            const data = await kpi_service_1.default.updateActualValue(id, parseFloat(actualValue), evidenceUrl);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const data = await kpi_service_1.default.delete(id);
            return res.status(200).json({ success: true, ...data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async uploadEvidence(req, res, next) {
        try {
            const { id } = req.params;
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Evidence file is required' });
            }
            const evidenceUrl = `/documents/${req.file.filename}`;
            const data = await kpi_service_1.default.updateEvidence(id, evidenceUrl);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async generateFromAbk(req, res, next) {
        try {
            const { employeeId, year, period } = req.body;
            if (!employeeId || !year || !period) {
                return res.status(400).json({ success: false, message: 'employeeId, year, and period are required' });
            }
            const data = await kpi_service_1.default.generateFromAbk(employeeId, parseInt(year), period);
            return res.status(201).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
    static async syncRealisasiFromWla(req, res, next) {
        try {
            const { employeeId, period } = req.body;
            if (!employeeId || !period) {
                return res.status(400).json({ success: false, message: 'employeeId and period are required' });
            }
            const data = await kpi_service_1.default.syncRealisasiFromWla(employeeId, period);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            return next(error);
        }
    }
}
exports.default = KpiController;
//# sourceMappingURL=kpi.controller.js.map