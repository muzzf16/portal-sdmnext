import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

const resolveDatabasePath = () => {
  const filename = process.env.DB_SOURCE || './database.sqlite';
  return path.resolve(filename);
};

const ensureDatabaseDirectory = (resolvedPath: string) => {
  const dir = path.dirname(resolvedPath);
  if (dir && dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const openDb = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  const resolvedPath = resolveDatabasePath();
  ensureDatabaseDirectory(resolvedPath);

  dbInstance = await open({
    filename: resolvedPath,
    driver: sqlite3.Database
  });

  return dbInstance;
};

export const closeDb = async () => {
  if (!dbInstance) {
    return;
  }

  await dbInstance.close();
  dbInstance = null;
};

export const withTransaction = async <T>(executor: (db: Database<sqlite3.Database, sqlite3.Statement>) => Promise<T>) => {
  const db = await openDb();

  await db.exec('BEGIN');

  try {
    const result = await executor(db);
    await db.exec('COMMIT');
    return result;
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
};
