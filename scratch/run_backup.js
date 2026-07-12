const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Host Database Backup
const hostDbPath = path.resolve(__dirname, '../database.sqlite');
const backupsDir = path.resolve(__dirname, '../backups');

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

if (fs.existsSync(hostDbPath)) {
  const backupName = `db_backup_host_${timestamp}.sqlite`;
  const destPath = path.join(backupsDir, backupName);
  fs.copyFileSync(hostDbPath, destPath);
  console.log(`[Host] Backed up local database to: ${destPath} (${fs.statSync(destPath).size} bytes)`);
} else {
  console.log(`[Host] Local database not found at ${hostDbPath}`);
}

// 2. Docker Database Backup
try {
  const dockerCheck = execSync('docker ps --filter "name=portal_sdm_backend" --format "{{.Names}}"').toString().trim();
  if (dockerCheck === 'portal_sdm_backend') {
    console.log('[Docker] Found running portal_sdm_backend container. Performing backup...');
    
    // We try to trigger the internal backup endpoint (which backs up database within the container's volume)
    try {
      const response = execSync('curl -s -X POST http://localhost:3334/api/backup/backup').toString();
      console.log('[Docker API] Backup response:', response);
    } catch (apiError) {
      console.log('[Docker API] Failed to trigger API backup:', apiError.message);
    }

    // Also extract the database from the container as a safety backup on the host
    const backupNameDocker = `db_backup_docker_${timestamp}.sqlite`;
    const hostDestPath = path.join(backupsDir, backupNameDocker);
    execSync(`docker cp portal_sdm_backend:/data/database.sqlite ${hostDestPath}`);
    console.log(`[Docker CLI] Copied container database to host: ${hostDestPath} (${fs.statSync(hostDestPath).size} bytes)`);
  } else {
    console.log('[Docker] Container portal_sdm_backend is not running.');
  }
} catch (dockerError) {
  console.log('[Docker] Docker is not available or failed to check:', dockerError.message);
}
