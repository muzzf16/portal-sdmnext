const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkITActivities() {
    const db = await open({
        filename: 'd:/portal-sdmv3/apps/backend/database.sqlite',
        driver: sqlite3.Database
    });

    const activities = await db.all("SELECT * FROM activity_library WHERE position LIKE '%IT%' OR department LIKE '%IT%'");
    console.log("IT Activities:", activities);

    await db.close();
}

checkITActivities().catch(console.error);
