const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/data/database.sqlite');

db.all('SELECT id, metadata FROM audit_logs WHERE device IS NULL', (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Found ${rows.length} rows to update.`);

  rows.forEach(row => {
    try {
      const metadata = JSON.parse(row.metadata);
      const userAgent = metadata.userAgent || '';
      let device = 'Web/Desktop';
      if (/mobile/i.test(userAgent)) device = 'Mobile';
      else if (/tablet/i.test(userAgent)) device = 'Tablet';

      db.run('UPDATE audit_logs SET device = ? WHERE id = ?', [device, row.id], (updErr) => {
        if (updErr) console.error(`Error updating row ${row.id}:`, updErr);
      });
    } catch (e) {
      console.error(`Error processing row ${row.id}:`, e);
    }
  });

  console.log('Update process started...');
  setTimeout(() => {
    db.close();
    console.log('Done.');
  }, 2000);
});
