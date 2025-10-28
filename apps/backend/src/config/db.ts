// src/config/db.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

export async function openDb() {
  const filename = process.env.DB_SOURCE || './database.sqlite';
  const resolved = path.resolve(filename);

  // Ensure directory exists for file-based sqlite DB
  try {
    const dir = path.dirname(resolved);
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to ensure DB directory exists:', err);
    throw err;
  }

  return open({
    filename: resolved,
    driver: sqlite3.Database
  });
}
