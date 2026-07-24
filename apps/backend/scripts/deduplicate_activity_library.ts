import { openDb } from '../src/config/db';

async function runDeduplication() {
    const db = await openDb();
    console.log('Memulai proses deduplikasi Activity Library...');

    try {
        await db.exec('BEGIN TRANSACTION');

        // Cari aktivitas ganda (berdasarkan position dan activityName, case insensitive)
        const duplicates = await db.all(`
            SELECT LOWER(position) as pos_lower, LOWER(activityName) as act_lower, COUNT(*) as count
            FROM activity_library
            GROUP BY pos_lower, act_lower
            HAVING count > 1
        `);

        console.log(`Ditemukan ${duplicates.length} grup aktivitas ganda.`);

        let totalWlaUpdated = 0;
        let totalActivitiesDeleted = 0;

        for (const group of duplicates) {
            // Ambil semua ID untuk grup ini (diurutkan by created_at)
            const activities = await db.all(`
                SELECT id 
                FROM activity_library 
                WHERE LOWER(position) = ? AND LOWER(activityName) = ?
                ORDER BY created_at ASC
            `, group.pos_lower, group.act_lower);

            const masterId = activities[0].id;
            const duplicateIds = activities.slice(1).map((a: any) => a.id);

            // Pindahkan semua WLA yang menggunakan ID duplikat ke Master ID
            const placeholders = duplicateIds.map(() => '?').join(',');
            const result = await db.run(`
                UPDATE log_aktivitas_harian 
                SET id_activity_library = ? 
                WHERE id_activity_library IN (${placeholders})
            `, [masterId, ...duplicateIds]);

            totalWlaUpdated += result.changes || 0;

            // Hapus aktivitas duplikat (sekarang aman karena WLA sudah dipindah)
            const delResult = await db.run(`
                DELETE FROM activity_library 
                WHERE id IN (${placeholders})
            `, duplicateIds);

            totalActivitiesDeleted += delResult.changes || 0;
        }

        await db.exec('COMMIT');
        console.log(`Proses selesai. ${totalWlaUpdated} log WLA berhasil diselamatkan (dipindahkan ke master ID).`);
        console.log(`${totalActivitiesDeleted} aktivitas ganda berhasil dihapus dari sistem.`);
        
    } catch (error) {
        await db.exec('ROLLBACK');
        console.error('Terjadi kesalahan, rollback transaksi:', error);
        process.exit(1);
    }
}

runDeduplication().then(() => {
    console.log('Script execution finished.');
    process.exit(0);
});
