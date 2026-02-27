const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
    try {
        const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

        console.log('Creating assigned_tasks table if not exists...');
        await db.run(`
            CREATE TABLE IF NOT EXISTS assigned_tasks (
                id TEXT PRIMARY KEY,
                supervisor_id TEXT NOT NULL,
                employee_id TEXT NOT NULL,
                task_name TEXT NOT NULL,
                description TEXT,
                status TEXT CHECK(status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supervisor_id) REFERENCES pegawai(id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES pegawai(id) ON DELETE CASCADE
            )
        `);
        console.log('Table assigned_tasks created successfully.');

        await db.close();
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
})();
