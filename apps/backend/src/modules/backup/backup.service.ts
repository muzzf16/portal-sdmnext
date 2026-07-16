
import fs from 'fs';
import path from 'path';

const BACKUP_ROOT = process.env.BACKUP_PATH || path.join(process.cwd(), 'backups');
const DB_BACKUP_DIR = path.join(BACKUP_ROOT, 'db');

const ensureDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Creates a backup of the current SQLite database file.
 */
export const backupDatabase = async () => {
  const sourcePath = path.resolve(process.env.DB_SOURCE || './database.sqlite');
  
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Database source file not found: ${sourcePath}`);
  }

  ensureDirectory(DB_BACKUP_DIR);

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `db_backup_${timestamp}.sqlite`;
  const destPath = path.join(DB_BACKUP_DIR, filename);

  // Perform the copy
  fs.copyFileSync(sourcePath, destPath);

  const stats = fs.statSync(destPath);

  return {
    success: true,
    message: 'Database backup created successfully',
    data: {
      filename,
      size: stats.size,
      createdAt: now
    }
  };
};

/**
 * Lists all available database backups.
 */
export const listBackups = async () => {
  ensureDirectory(DB_BACKUP_DIR);
  
  const files = fs.readdirSync(DB_BACKUP_DIR)
    .filter(f => f.endsWith('.sqlite'))
    .map(f => {
      const fullPath = path.join(DB_BACKUP_DIR, f);
      const stats = fs.statSync(fullPath);
      return {
        filename: f,
        size: stats.size,
        createdAt: stats.mtime
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    success: true,
    data: files
  };
};

/**
 * Restores the database from a specified backup file.
 * WARNING: This will overwrite the current database.
 */
export const restoreDatabase = async (filename: string) => {
  if (!filename) {
    throw new Error('Filename is required for restore');
  }

  const sourcePath = path.join(DB_BACKUP_DIR, filename);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Backup file not found: ${filename}`);
  }

  const destPath = path.resolve(process.env.DB_SOURCE || './database.sqlite');

  // Safety first: Create a backup of the CURRENT database before overwriting
  const now = new Date();
  const safetyTimestamp = now.getTime();
  const safetyFilename = `safety_pre_restore_${safetyTimestamp}.sqlite`;
  
  if (fs.existsSync(destPath)) {
    fs.copyFileSync(destPath, path.join(DB_BACKUP_DIR, safetyFilename));
  }

  // Overwrite the production database with the backup
  fs.copyFileSync(sourcePath, destPath);

  return {
    success: true,
    message: `Database restored successfully from ${filename}. A safety backup was created as ${safetyFilename}.`,
    data: {
      restoredFrom: filename,
      safetyBackup: safetyFilename
    }
  };
};

/**
 * Restores the database from an uploaded backup file.
 * WARNING: This will overwrite the current database.
 */
export const restoreFromUploadedFile = async (uploadedFilePath: string) => {
  if (!uploadedFilePath) {
    throw new Error('Uploaded file path is required');
  }

  if (!fs.existsSync(uploadedFilePath)) {
    throw new Error('Uploaded backup file not found');
  }

  const destPath = path.resolve(process.env.DB_SOURCE || './database.sqlite');

  ensureDirectory(DB_BACKUP_DIR);

  const now = new Date();
  const safetyTimestamp = now.getTime();
  const safetyFilename = `safety_pre_restore_${safetyTimestamp}.sqlite`;

  if (fs.existsSync(destPath)) {
    fs.copyFileSync(destPath, path.join(DB_BACKUP_DIR, safetyFilename));
  }

  fs.copyFileSync(uploadedFilePath, destPath);

  // Cleanup uploaded temp file
  try {
    fs.unlinkSync(uploadedFilePath);
  } catch (cleanupError) {
    console.error('Failed to cleanup temp backup file:', cleanupError);
  }

  return {
    success: true,
    message: `Database restored successfully from uploaded file. A safety backup was created as ${safetyFilename}.`,
    data: {
      safetyBackup: safetyFilename
    }
  };
};

/**
 * Gets the absolute path of a backup file.
 */
export const getBackupFilePath = (filename: string) => {
  if (!filename) {
    throw new Error('Filename is required');
  }

  // Security: prevent path traversal
  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(DB_BACKUP_DIR, sanitizedFilename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Backup file not found: ${sanitizedFilename}`);
  }

  return filePath;
};
