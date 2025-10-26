"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PelatihanRepository = void 0;
const db_1 = require("../../config/db");
exports.PelatihanRepository = {
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM pelatihan WHERE pegawai_id = ?', employeeId);
        return rows;
    },
    async create(employeeId, data) {
        const db = await (0, db_1.openDb)();
        const { nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat } = data;
        await db.run('INSERT INTO pelatihan (pegawai_id, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat) VALUES (?, ?, ?, ?, ?, ?)', employeeId, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat);
        return { message: 'Pelatihan added successfully' };
    }
};
//# sourceMappingURL=pelatihan.repository.js.map