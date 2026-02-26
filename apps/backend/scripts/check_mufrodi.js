const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

async function checkPegawai() {
    const db = await open({
        filename: 'd:/portal-sdmv3/apps/backend/database.sqlite',
        driver: sqlite3.Database
    });

    const mufrodi = await db.all("SELECT * FROM pegawai WHERE name LIKE '%Mufrodi%'");
    console.log("Mufrodi:", mufrodi);

    const itStaff = await db.all("SELECT * FROM pegawai WHERE position LIKE '%IT%'");
    console.log("IT Staff:", itStaff);

    const activityLibrary = await db.all("SELECT * FROM activity_library LIMIT 10");
    console.log("Activity Library:", activityLibrary);

    await db.close();
}

checkPegawai().catch(console.error);
