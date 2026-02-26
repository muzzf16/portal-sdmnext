const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = 'd:/portal-sdmv3/apps/backend/database.sqlite';

async function generateData() {
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    const mufrodi = await db.get("SELECT * FROM pegawai WHERE name LIKE '%Mufrodi%'");
    if (!mufrodi) {
        console.error("Mufrodi not found!");
        await db.close();
        return;
    }

    const id_pegawai = mufrodi.id;
    console.log("Found Mufrodi: " + mufrodi.name + " (ID: " + id_pegawai + ")");

    const itActivities = await db.all("SELECT * FROM activity_library WHERE position = 'Staf Pelaporan Dan IT' OR position LIKE '%IT%'");
    if (itActivities.length === 0) {
        console.error("No IT activities found!");
        await db.close();
        return;
    }

    await db.run("DELETE FROM log_aktivitas_harian WHERE id_pegawai = ? AND tanggal LIKE '2026-%'", [id_pegawai]);
    console.log("Cleared existing 2026 data for Mufrodi");

    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-12-31');

    let currentDate = new Date(startDate);
    const logsToInsert = [];

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let totalLogs = 0;

    // Helper functions for zero-padded date formatting
    const pad = (n) => (n < 10 ? '0' + n : n);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();

        // Skip weekends (0: Sun, 6: Sat)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {

            const numActivities = Math.floor(Math.random() * 3) + 2;
            const chosenActivities = [];

            for (let i = 0; i < numActivities; i++) {
                const activity = getRandomItem(itActivities);

                if (!chosenActivities.includes(activity)) {
                    chosenActivities.push(activity);
                    const frekuensi = Math.floor(Math.random() * 3) + 1; // 1 to 3
                    const durasi = activity.durationMinutes * frekuensi;

                    const dateStr = currentDate.getFullYear() + "-" + pad(currentDate.getMonth() + 1) + "-" + pad(currentDate.getDate());

                    logsToInsert.push({
                        id_pegawai: id_pegawai,
                        tanggal: dateStr,
                        id_activity_library: activity.id,
                        frekuensi: frekuensi,
                        total_durasi_terhitung: durasi,
                        catatan: "Dummy daily log for " + dateStr,
                        status_approval: 'approved'
                    });
                }
            }
        }

        // Next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("Ready to insert " + logsToInsert.length + " logs for Mufrodi in 2026");

    for (const log of logsToInsert) {
        await db.run(
            `INSERT INTO log_aktivitas_harian 
             (id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, catatan, status_approval) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [log.id_pegawai, log.tanggal, log.id_activity_library, log.frekuensi, log.total_durasi_terhitung, log.catatan, log.status_approval]
        );
        totalLogs++;
    }

    console.log("Successfully inserted " + totalLogs + " logs for Mufrodi.");

    await db.close();
}

generateData().catch(console.error);
