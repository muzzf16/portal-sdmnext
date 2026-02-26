const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
(async () => {
    const db = await open({ filename: process.env.DB_SOURCE || '/data/database.sqlite', driver: sqlite3.Database });

    // Check remaining pegawai
    const remaining = await db.get("SELECT COUNT(*) as cnt FROM pegawai WHERE avatarUrl LIKE 'http://localhost%' OR avatarUrl LIKE 'http://127.0.0.1%'");
    console.log(`Remaining localhost URLs in pegawai: ${remaining.cnt}`);

    // Check if pengguna has avatarUrl column
    const cols = await db.all("PRAGMA table_info(pengguna)");
    const colNames = cols.map(c => c.name);
    console.log('Pengguna columns:', colNames.join(', '));

    // Check users table too
    const userCols = await db.all("PRAGMA table_info(users)");
    const userColNames = userCols.map(c => c.name);
    console.log('Users columns:', userColNames.join(', '));

    if (userColNames.includes('avatarUrl')) {
        const userRows = await db.all("SELECT id, username, avatarUrl FROM users WHERE avatarUrl LIKE 'http://localhost%' OR avatarUrl LIKE 'http://127.0.0.1%'");
        console.log(`Found ${userRows.length} users with localhost avatar URLs`);
        for (const row of userRows) {
            const newUrl = row.avatarUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
            await db.run('UPDATE users SET avatarUrl = ? WHERE id = ?', newUrl, row.id);
            console.log(`  Fixed: ${row.username}: ${row.avatarUrl} -> ${newUrl}`);
        }
    }

    // Verify final state - show sample avatarUrl values
    const samples = await db.all("SELECT name, avatarUrl FROM pegawai LIMIT 3");
    console.log('\nSample pegawai avatarUrls:');
    samples.forEach(s => console.log(`  ${s.name}: ${s.avatarUrl}`));

    await db.close();
})();
