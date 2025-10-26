"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaveSummary = void 0;
const getLeaveSummary = async (employeeId) => {
    return {
        employeeId,
        totalLeave: 0,
        usedLeave: 0,
        remainingLeave: 0
    };
};
exports.getLeaveSummary = getLeaveSummary;
//# sourceMappingURL=miscService.js.map