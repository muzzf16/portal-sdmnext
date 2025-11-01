const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Checking contracts and notifications relationships...');

db.serialize(() => {
  // Check how many contracts exist
  db.get('SELECT COUNT(*) as count FROM kontrak', (err, row) => {
    if (err) {
      console.error('Error counting contracts:', err.message);
    } else {
      console.log('Total contracts:', row.count);
    }
  });

  // Check how many notifications exist with contract as related_entity
  db.get('SELECT COUNT(*) as count FROM notifications WHERE related_entity = "contract"', (err, row) => {
    if (err) {
      console.error('Error counting contract notifications:', err.message);
    } else {
      console.log('Contract-related notifications:', row.count);
    }
  });
  
  // Get some example notifications to check the related_entity_id values
  db.all('SELECT related_entity_id FROM notifications WHERE related_entity = "contract" LIMIT 5', (err, rows) => {
    if (err) {
      console.error('Error getting contract notification IDs:', err.message);
    } else {
      console.log('Example related_entity_ids for contract notifications:', rows);
    }
  });
  
  // Check if related_entity_id values in notifications actually exist in kontrak table
  db.all(`
    SELECT n.related_entity_id 
    FROM notifications n
    LEFT JOIN kontrak k ON n.related_entity_id = k.id
    WHERE n.related_entity = "contract" AND k.id IS NULL
    LIMIT 10
  `, (err, rows) => {
    if (err) {
      console.error('Error checking for orphaned contract notifications:', err.message);
    } else {
      console.log('Orphaned notification contract IDs (notifications pointing to non-existent contracts):', rows);
    }
    
    db.close();
  });
});