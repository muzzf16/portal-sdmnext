CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    request_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS release_changelog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    release_tag TEXT NOT NULL,
    module TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    impacted_files TEXT DEFAULT '[]',
    created_by TEXT DEFAULT 'system',
    released_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_release_changelog_release_tag ON release_changelog(release_tag);
CREATE INDEX IF NOT EXISTS idx_release_changelog_module ON release_changelog(module);
CREATE INDEX IF NOT EXISTS idx_release_changelog_released_at ON release_changelog(released_at);
