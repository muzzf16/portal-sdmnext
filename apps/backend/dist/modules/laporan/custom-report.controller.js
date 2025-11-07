"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const custom_report_service_1 = __importDefault(require("./custom-report.service"));
class CustomReportController {
    static async getReportMetadata(req, res, next) {
        try {
            const metadata = await custom_report_service_1.default.getReportMetadata();
            return res.status(200).json({
                success: true,
                data: metadata
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async generateCustomReport(req, res, next) {
        try {
            const { filters, fields, reportType } = req.body;
            if (!reportType) {
                return res.status(400).json({
                    success: false,
                    message: 'Report type is required'
                });
            }
            if (!Array.isArray(fields) || fields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one field must be selected'
                });
            }
            const report = await custom_report_service_1.default.generateCustomReport(filters, fields, reportType);
            return res.status(200).json({
                success: true,
                data: report,
                metadata: {
                    reportType,
                    fields,
                    filters,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async exportCustomReport(req, res, next) {
        try {
            const { filters, fields, reportType } = req.body;
            if (!reportType) {
                return res.status(400).json({
                    success: false,
                    message: 'Report type is required'
                });
            }
            if (!Array.isArray(fields) || fields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one field must be selected'
                });
            }
            const report = await custom_report_service_1.default.generateCustomReport(filters, fields, reportType);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=custom-report-${reportType}.xlsx`);
            return res.status(200).json({
                success: true,
                data: report,
                metadata: {
                    reportType,
                    fields,
                    filters,
                    exportFormat: 'xlsx',
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
}
exports.default = CustomReportController;
//# sourceMappingURL=custom-report.controller.js.map