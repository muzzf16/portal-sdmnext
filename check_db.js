const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/opt/portal-sdmv3/database.sqlite');

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) throw err;
        tables.forEach(table => {
            const tableName = table.name;
            db.get(`PRAGMA table_info(${tableName})`, (err, columns) => {
                if (err) return;
                db.all(`PRAGMA table_info(${tableName})`, (err, cols) => {
                    const hasCreatedAt = cols.some(c => c.name === 'created_at' || c.name === 'createdAt');
                    const hasTanggal = cols.some(c => c.name === 'tanggal');
                    
                    if (hasCreatedAt) {
                        const col = cols.find(c => c.name === 'created_at') ? 'created_at' : 'createdAt';
                        db.get(`SELECT MAX(${col}) as max_date FROM ${tableName}`, (err, row) => {
                            if (row && row.max_date) console.log(`${tableName} max ${col}: ${row.max_date}`);
                        });
                    }
                    if (hasTanggal) {
                        db.get(`SELECT MAX(tanggal) as max_date FROM ${tableName}`, (err, row) => {
                            if (row && row.max_date) console.log(`${tableName} max tanggal: ${row.max_date}`);
                        });
                    }
                });
            });
        });
    });
});
