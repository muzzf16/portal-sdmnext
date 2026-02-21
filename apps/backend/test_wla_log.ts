import LogAktivitasHarianService from './src/modules/log-aktivitas-harian/log-aktivitas-harian.service';
import { openDb } from './src/config/db';

(async () => {
    try {
        const db = await openDb();
        console.log('--- Testing WLA Daily Log ---');

        // 1. Check if activity_library has data
        const activity = await db.get('SELECT * FROM activity_library LIMIT 1');
        if (!activity) {
            console.log('No activities found in activity_library. Seeding one for test...');
            await db.run(
                `INSERT INTO activity_library (position, department, activityName, durationMinutes, outputUnit, category) 
                 VALUES ('CS', 'Operasional', 'TEST_ACTIVITY', 15, 'Nasabah', 'operasional')`
            );
        }

        const testActivity = await db.get('SELECT * FROM activity_library LIMIT 1');
        console.log('Using Activity:', testActivity);

        // 2. Test createLog
        console.log('\\nCreating log...');
        const activityId = testActivity.id_activity_library || testActivity.id;
        const newLog = await LogAktivitasHarianService.createLog({
            id_pegawai: 999, // mock employee id
            tanggal: new Date().toISOString().split('T')[0],
            id_activity_library: activityId,
            frekuensi: 5,
            catatan: 'Test log'
        });
        console.log('Log created:', newLog);

        // Ensure total_durasi_terhitung is correct (frekuensi * durationMinutes)
        if (newLog.total_durasi_terhitung !== 5 * testActivity.durationMinutes) {
            throw new Error(`Calculation mismatch! Expected ${5 * testActivity.durationMinutes}, got ${newLog.total_durasi_terhitung}`);
        }
        console.log('✅ Calculation is correct!');

        // 3. Test summary admin
        console.log('\\nFetching admin summary...');
        const summary = await LogAktivitasHarianService.getAdminSummaryByDate(newLog.tanggal);
        console.log('Summary:', summary);

        // Clean up test data
        await db.run('DELETE FROM log_aktivitas_harian WHERE id_pegawai = 999');
        if (testActivity.activityName === 'TEST_ACTIVITY') {
            await db.run('DELETE FROM activity_library WHERE id_activity_library = ?', testActivity.id_activity_library);
        }

        console.log('\\nAll tests passed successfully!');
        process.exit(0);
    } catch (e: any) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
})();
