-- ALTER TABLE notifications ADD COLUMN created_at DATETIME;
UPDATE notifications SET created_at = datetime('now') WHERE created_at IS NULL;
