const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/data/database.sqlite');
db.all('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10', (err, rows) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
  db.close();
});
