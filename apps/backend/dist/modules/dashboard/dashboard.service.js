"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_repository_1 = require("./dashboard.repository");
const errors_1 = require("../../utils/errors");
class DashboardService {
    static async getRecentActivity() {
        try {
            return await dashboard_repository_1.DashboardRepository.getRecentActivity();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving recent activity: ${error.message}`, 500);
        }
    }
}
exports.default = DashboardService;
//# sourceMappingURL=dashboard.service.js.map