"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestStatus = exports.findRequestById = exports.findAllRequests = exports.createRequest = void 0;
const db_1 = require("../../config/db");
const createRequest = async (request) => {
    const db = await (0, db_1.openDb)();
    const result = await db.run('INSERT INTO data_change_requests (employeeId, requestedChanges) VALUES (?, ?)', [request.employeeId, request.requestedChanges]);
    return result.lastID;
};
exports.createRequest = createRequest;
const findAllRequests = async () => {
    const db = await (0, db_1.openDb)();
    return db.all('SELECT * FROM data_change_requests ORDER BY createdAt DESC');
};
exports.findAllRequests = findAllRequests;
const findRequestById = async (id) => {
    const db = await (0, db_1.openDb)();
    return db.get('SELECT * FROM data_change_requests WHERE id = ?', id);
};
exports.findRequestById = findRequestById;
const updateRequestStatus = async (id, status, reviewedBy, reviewNotes) => {
    const db = await (0, db_1.openDb)();
    await db.run('UPDATE data_change_requests SET status = ?, reviewedBy = ?, reviewNotes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [status, reviewedBy, reviewNotes, id]);
};
exports.updateRequestStatus = updateRequestStatus;
//# sourceMappingURL=permintaanPerubahanData.repository.js.map