const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
(async () => {
    const db = await open({ filename: process.env.DB_SOURCE || '/data/database.sqlite', driver: sqlite3.Database });
    const total = await db.get('SELECT COUNT(*) as cnt FROM activity_library');
    const nullIds = await db.all("SELECT rowid, position, activityName FROM activity_library WHERE id IS NULL OR id = ''");
    console.log(`Total: ${total.cnt}, NULL ids: ${nullIds.length}`);
    if (nullIds.length > 0) {
        console.log('Fixing NULL ids...');
        for (const rec of nullIds) {
            const abbr = rec.position.toLowerCase().replace(/[^a-z]/g, '').substring(0, 4);
            const newId = `act-${abbr}-${rec.rowid}`;
            await db.run('UPDATE activity_library SET id = ? WHERE rowid = ?', newId, rec.rowid);
            console.log(`  Fixed: ${rec.position} / ${rec.activityName} -> ${newId}`);
        }
        console.log('Done!');
    } else {
        console.log('All IDs are OK');
    }
    await db.close();
})();
