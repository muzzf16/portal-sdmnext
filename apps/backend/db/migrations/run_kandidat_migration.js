const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
    const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

    const cols = [
        ["cover_letter", "TEXT DEFAULT ''"],
        ["application_date", "TEXT DEFAULT ''"],
        ["notes", "TEXT DEFAULT ''"],
        ["created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"]
    ];

    for (const [col, type] of cols) {
        try {
            await db.exec(`ALTER TABLE kandidat ADD COLUMN ${col} ${type}`);
            console.log(`Added ${col}`);
        } catch (e) {
            console.log(`${col}: ${e.message}`);
        }
    }
    console.log('Migration done');
})();
