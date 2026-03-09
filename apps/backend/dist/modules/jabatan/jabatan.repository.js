"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JabatanRepository = void 0;
const db_1 = require("../../config/db");
exports.JabatanRepository = {
    async findAll() {
        const db = await (0, db_1.openDb)();
        return db.all(`
      SELECT j.*, p.nama as parent_nama
      FROM jabatan j
      LEFT JOIN jabatan p ON j.parent_id = p.id
      ORDER BY j.level ASC, j.nama ASC
    `);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        return db.get(`
      SELECT j.*, p.nama as parent_nama
      FROM jabatan j
      LEFT JOIN jabatan p ON j.parent_id = p.id
      WHERE j.id = ?
    `, id);
    },
    async findByLevel(level) {
        const db = await (0, db_1.openDb)();
        return db.all('SELECT * FROM jabatan WHERE level = ? ORDER BY nama ASC', level);
    },
    async findChildren(parentId) {
        const db = await (0, db_1.openDb)();
        return db.all('SELECT * FROM jabatan WHERE parent_id = ? ORDER BY level ASC, nama ASC', parentId);
    },
    async getTree() {
        const db = await (0, db_1.openDb)();
        const all = await db.all('SELECT * FROM jabatan ORDER BY level ASC, nama ASC');
        const buildTree = (parentId) => {
            return all
                .filter(j => j.parent_id === parentId)
                .map(j => ({
                ...j,
                children: buildTree(j.id)
            }));
        };
        return buildTree(null);
    },
    async getTreeWithEmployees() {
        const db = await (0, db_1.openDb)();
        const allJabatan = await db.all('SELECT * FROM jabatan ORDER BY level ASC, nama ASC');
        const allPegawaiRaw = await db.all(`
      SELECT id, name, nip, position, department, avatarUrl, jabatan_id, atasan_id
      FROM pegawai
      WHERE isActive = 1
      ORDER BY name ASC
    `);
        const allPegawai = allPegawaiRaw.map(p => ({
            ...p,
            avatarUrl: p.avatarUrl ? p.avatarUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '') : p.avatarUrl
        }));
        const buildTree = (parentId) => {
            return allJabatan
                .filter(j => j.parent_id === parentId)
                .map(j => ({
                ...j,
                employees: allPegawai.filter(p => p.jabatan_id === j.id),
                children: buildTree(j.id)
            }));
        };
        return buildTree(null);
    },
    async getSubordinates(pegawaiId) {
        const db = await (0, db_1.openDb)();
        const supervisor = await db.get('SELECT jabatan_id FROM pegawai WHERE id = ?', pegawaiId);
        if (!supervisor || !supervisor.jabatan_id)
            return [];
        const direct = await db.all(`SELECT p.id, p.name, p.nip, p.position, p.department, p.avatarUrl, p.jabatan_id, p.atasan_id 
             FROM pegawai p
             JOIN jabatan j ON p.jabatan_id = j.id
             WHERE j.parent_id = ? AND p.isActive = 1`, supervisor.jabatan_id);
        return direct.map(p => ({
            ...p,
            avatarUrl: p.avatarUrl ? p.avatarUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '') : p.avatarUrl
        }));
    },
    async getAllSubordinates(pegawaiId) {
        const db = await (0, db_1.openDb)();
        const supervisor = await db.get('SELECT jabatan_id FROM pegawai WHERE id = ?', pegawaiId);
        if (!supervisor || !supervisor.jabatan_id)
            return [];
        const result = [];
        const fetchSubs = async (jabatanId) => {
            const subs = await db.all(`SELECT p.id, p.name, p.nip, p.position, p.department, p.avatarUrl, p.jabatan_id, p.atasan_id, j.id as child_jabatan_id 
                 FROM pegawai p
                 JOIN jabatan j ON p.jabatan_id = j.id
                 WHERE j.parent_id = ? AND p.isActive = 1`, jabatanId);
            const uniqueChildJabatanIds = [...new Set(subs.map(s => s.child_jabatan_id))];
            result.push(...subs.map(p => ({
                ...p,
                avatarUrl: p.avatarUrl ? p.avatarUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '') : p.avatarUrl
            })));
            for (const childJabId of uniqueChildJabatanIds) {
                await fetchSubs(childJabId);
            }
        };
        await fetchSubs(supervisor.jabatan_id);
        const uniquePegawaiIds = new Set();
        const distinctResult = [];
        for (const emp of result) {
            if (!uniquePegawaiIds.has(emp.id)) {
                uniquePegawaiIds.add(emp.id);
                distinctResult.push(emp);
            }
        }
        return distinctResult;
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('INSERT INTO jabatan (nama, level, parent_id, department, deskripsi) VALUES (?, ?, ?, ?, ?)', [data.nama, data.level, data.parent_id || null, data.department || null, data.deskripsi || null]);
        return this.findById(result.lastID);
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        const fields = [];
        const values = [];
        if (data.nama !== undefined) {
            fields.push('nama = ?');
            values.push(data.nama);
        }
        if (data.level !== undefined) {
            fields.push('level = ?');
            values.push(data.level);
        }
        if (data.parent_id !== undefined) {
            fields.push('parent_id = ?');
            values.push(data.parent_id);
        }
        if (data.department !== undefined) {
            fields.push('department = ?');
            values.push(data.department);
        }
        if (data.deskripsi !== undefined) {
            fields.push('deskripsi = ?');
            values.push(data.deskripsi);
        }
        if (fields.length === 0)
            return this.findById(id);
        values.push(id);
        await db.run(`UPDATE jabatan SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const linked = await db.get('SELECT COUNT(*) as count FROM pegawai WHERE jabatan_id = ?', id);
        if (linked?.count > 0) {
            throw new Error('Tidak dapat menghapus jabatan yang masih memiliki pegawai terkait');
        }
        const children = await db.get('SELECT COUNT(*) as count FROM jabatan WHERE parent_id = ?', id);
        if (children?.count > 0) {
            throw new Error('Tidak dapat menghapus jabatan yang masih memiliki sub-jabatan');
        }
        const result = await db.run('DELETE FROM jabatan WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};
//# sourceMappingURL=jabatan.repository.js.map