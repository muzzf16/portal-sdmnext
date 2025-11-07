"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PelatihanRepository = void 0;
const db_1 = require("../../config/db");
const mapToCamelCase = (row) => ({
    id: row.id,
    employeeId: row.pegawai_id,
    trainingName: row.nama_pelatihan,
    organizer: row.penyelenggara,
    startDate: row.tanggal_mulai,
    endDate: row.tanggal_selesai,
    certificate: row.nomor_sertifikat,
});
exports.PelatihanRepository = {
    async findAll() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM pelatihan');
        return rows.map(mapToCamelCase);
    },
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM pelatihan WHERE pegawai_id = ?', employeeId);
        return rows.map(mapToCamelCase);
    },
    async create(employeeId, data) {
        const db = await (0, db_1.openDb)();
        const { nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat } = data;
        await db.run('INSERT INTO pelatihan (pegawai_id, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat) VALUES (?, ?, ?, ?, ?, ?)', employeeId, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat);
        return { message: 'Pelatihan added successfully' };
    }
};
//# sourceMappingURL=pelatihan.repository.js.map