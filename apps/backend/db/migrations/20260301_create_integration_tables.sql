-- 20260301_create_integration_tables.sql
-- Migration script to create tables for integration features: api_keys and integration_logs

-- Table for storing valid API keys
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,         -- e.g., 'Sistem Keuangan', 'HRIS Pusat'
    key_hash TEXT NOT NULL,     -- The hashed API key for security
    status TEXT CHECK(status IN ('aktif', 'nonaktif')) DEFAULT 'aktif',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing logs of all integration requests
CREATE TABLE IF NOT EXISTS integration_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER,         -- Optional, null if request failed authentication
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL
);
