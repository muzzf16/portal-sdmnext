const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
    const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

    // Update Mufrodi's ABK string to match the exact library string
    await db.run(`UPDATE detail_beban_kerja SET activityName = 'Doa pagi dan pengarahan' WHERE id = 'item-1771784246876-kfth8apnt'`);

    // Update Mufrodi's KPI name to match the exact library string
    await db.run(`UPDATE kpi_targets SET kpiName = 'Penyelesaian Doa pagi dan pengarahan' WHERE id = 'kpi-1772089387300-mpi9olqtw'`);
    await db.run(`UPDATE kpi_targets SET kpiName = 'Penyelesaian Doa pagi dan pengarahan' WHERE id = 'kpi-1772097702624-4qlwqkcxx'`);

    console.log('Fixed names in DB');
    await db.close();
})();
