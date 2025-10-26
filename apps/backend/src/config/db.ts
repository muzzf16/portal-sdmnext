// src/config/db.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: process.env.DB_SOURCE || './database.sqlite',
    driver: sqlite3.Database
  });
}
