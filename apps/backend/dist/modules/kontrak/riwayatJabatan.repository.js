"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiwayatJabatanRepository = void 0;
const db_1 = require("../../config/db");
exports.RiwayatJabatanRepository = {
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM riwayat_jabatan WHERE pegawai_id = ?', employeeId);
        return rows;
    },
    async create(employeeId, data) {
        const db = await (0, db_1.openDb)();
        const { jabatan_lama, jabatan_baru, tanggal_perubahan } = data;
        await db.run('INSERT INTO riwayat_jabatan (pegawai_id, jabatan_lama, jabatan_baru, tanggal_perubahan) VALUES (?, ?, ?, ?)', employeeId, jabatan_lama, jabatan_baru, tanggal_perubahan);
        return { message: 'Riwayat jabatan added successfully' };
    }
};
//# sourceMappingURL=riwayatJabatan.repository.js.map