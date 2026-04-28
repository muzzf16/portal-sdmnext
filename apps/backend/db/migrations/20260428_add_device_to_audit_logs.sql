-- Add device column to audit_logs
ALTER TABLE audit_logs ADD COLUMN device TEXT;
