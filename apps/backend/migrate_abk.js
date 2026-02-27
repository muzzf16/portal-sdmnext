const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
    try {
        const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

        // 2. Backfill existing records by trying to match names
        console.log('Backfilling activityId for existing detail_beban_kerja records...');
        const items = await db.all("SELECT id, activityName FROM detail_beban_kerja WHERE activityId IS NULL");
        const library = await db.all("SELECT id, activityName FROM activity_library");

        let updateCount = 0;
        for (const item of items) {
            // Try exact match first
            let match = library.find(l => l.activityName.toLowerCase() === item.activityName.toLowerCase());

            // Try fuzzy match if exact fails
            if (!match) {
                match = library.find(l =>
                    l.activityName.toLowerCase().includes(item.activityName.toLowerCase()) ||
                    item.activityName.toLowerCase().includes(l.activityName.toLowerCase())
                );
            }

            if (match) {
                await db.run("UPDATE detail_beban_kerja SET activityId = ? WHERE id = ?", match.id, item.id);
                updateCount++;
            }
        }
        console.log(`Backfilled ${updateCount} out of ${items.length} records.`);

        await db.close();
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
})();
