-- ====================================================
-- Migration: Per-employee nominal KPI targets
-- Allows admin to set individual targets for NPL, Kredit, Dana per employee
-- ====================================================

CREATE TABLE IF NOT EXISTS kpi_nominal_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('npl', 'kredit', 'dana')),
    target_amount REAL NOT NULL DEFAULT 0,
    notes TEXT,
    updated_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, category)
);
