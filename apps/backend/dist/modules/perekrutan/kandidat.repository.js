"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KandidatRepository = void 0;
const db_1 = require("../../config/db");
exports.KandidatRepository = {
    async findAll() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM kandidat');
        return rows;
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM kandidat WHERE id = ?', id);
        return row;
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
        const { name, email, phone, position_applied, status, resume_url } = data;
        const result = await db.run('INSERT INTO kandidat (name, email, phone, position_applied, status, resume_url) VALUES (?, ?, ?, ?, ?, ?)', name, email, phone, position_applied, status, resume_url);
        return { id: result.lastID, ...data };
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        const { name, email, phone, position_applied, status, resume_url } = data;
        const result = await db.run('UPDATE kandidat SET name = ?, email = ?, phone = ?, position_applied = ?, status = ?, resume_url = ? WHERE id = ?', name, email, phone, position_applied, status, resume_url, id);
        if (result.changes === 0)
            throw new Error('Candidate not found');
        return { id, ...data };
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM kandidat WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};
//# sourceMappingURL=kandidat.repository.js.map