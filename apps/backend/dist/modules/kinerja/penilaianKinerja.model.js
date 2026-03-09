"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_TRANSITIONS = void 0;
exports.VALID_TRANSITIONS = {
    'Draft': ['Awaiting SA'],
    'Awaiting SA': ['SA Submitted', 'Draft'],
    'SA Submitted': ['In Review'],
    'In Review': ['Completed', 'SA Submitted'],
    'Completed': ['Finalized', 'In Review'],
    'Finalized': [],
};
//# sourceMappingURL=penilaianKinerja.model.js.map