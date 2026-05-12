const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

(async () => {
    const db = await open({ filename: process.env.DB_SOURCE || '/data/database.sqlite', driver: sqlite3.Database });
    const results = await db.all("SELECT * FROM activity_library WHERE (LOWER(position) LIKE '%kabid kredit%' OR LOWER(position) LIKE '%kasubid admin%') AND LOWER(activityName) LIKE '%berkas%'");
    console.log(JSON.stringify(results, null, 2));
    await db.close();
})();
