"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifikasiRepository = void 0;
const db_1 = require("../../config/db");
const parseJsonFields = (rows) => {
    return rows;
};
exports.NotifikasiRepository = {
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM notifikasi WHERE employee_id = ? ORDER BY created_at DESC', employeeId);
        return parseJsonFields(rows);
    },
    async findUnreadByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM notifikasi WHERE employee_id = ? AND is_read = 0 ORDER BY created_at DESC', employeeId);
        return parseJsonFields(rows);
    },
    async create(notificationData) {
        const db = await (0, db_1.openDb)();
        const { employee_id, message, type = 'info', delivery_channel = 'in_app', related_entity, related_entity_id, scheduled_for } = notificationData;
        const result = await db.run(`INSERT INTO notifikasi (employee_id, message, type, delivery_channel, related_entity, related_entity_id, scheduled_for) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, employee_id, message, type, delivery_channel, related_entity, related_entity_id, scheduled_for);
        return {
            id: result.lastID,
            employee_id,
            message,
            type,
            delivery_channel,
            related_entity,
            related_entity_id,
            scheduled_for,
            is_read: false,
            created_at: new Date().toISOString()
        };
    },
    async markAsRead(notificationId) {
        const db = await (0, db_1.openDb)();
        await db.run('UPDATE notifikasi SET is_read = 1 WHERE id = ?', notificationId);
        return { id: notificationId, is_read: true };
    },
    async findScheduledNotifications() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM notifikasi WHERE scheduled_for IS NOT NULL AND scheduled_for <= datetime("now") AND is_read = 0');
        return parseJsonFields(rows);
    }
};
//# sourceMappingURL=notifikasi.repository.js.map