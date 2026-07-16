const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbFiles = [
  { name: 'temp_docker_db.sqlite (from container)', path: './temp_docker_db.sqlite' },
  { name: 'database.sqlite (root)', path: './database.sqlite' },
  { name: 'apps/backend/database.sqlite', path: './apps/backend/database.sqlite' },
  { name: 'database_backup_before_duplicate_20260712.sqlite', path: './database_backup_before_duplicate_20260712.sqlite' },
  { name: 'db_backup_2026-07-10T04-00-50.sqlite', path: './db_backup_2026-07-10T04-00-50.sqlite' },
  { name: 'backup_temp.sqlite', path: './backup_temp.sqlite' }
];

async function analyze() {
  for (const dbInfo of dbFiles) {
    const resolvedPath = path.resolve(dbInfo.path);
    if (!fs.existsSync(resolvedPath)) {
      console.log(`❌ File not found: ${dbInfo.name} (${dbInfo.path})`);
      continue;
    }
    
    const stats = fs.statSync(resolvedPath);
    console.log(`\n==================================================`);
    console.log(`📊 DB: ${dbInfo.name}`);
    console.log(`   Path: ${resolvedPath}`);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(3)} MB (${stats.size} bytes)`);
    
    try {
      const db = await open({
        filename: resolvedPath,
        driver: sqlite3.Database
      });
      
      // Get all tables
      const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      console.log(`   Tables (${tables.length}):`);
      for (const t of tables) {
        try {
          const count = await db.get(`SELECT COUNT(*) as count FROM "${t.name}"`);
          console.log(`     - ${t.name}: ${count.count} rows`);
          
          if (t.name === 'users') {
            const users = await db.all(`SELECT id, email, name, role, employeeId FROM users`);
            console.log(`       Users:`);
            users.forEach(u => {
              console.log(`         * [${u.role}] ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, EmpId: ${u.employeeId}`);
            });
          }
        } catch (tableErr) {
          console.log(`     - ${t.name}: Error getting count (${tableErr.message})`);
        }
      }
      
      await db.close();
    } catch (err) {
      console.log(`❌ Error opening DB: ${err.message}`);
    }
  }
}

analyze().catch(err => console.error(err));
