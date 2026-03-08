-- Migration: Create kpi_templates table for reusable KPI templates per department
-- Date: 2026-03-08

CREATE TABLE IF NOT EXISTS kpi_templates (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    kpiName TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'outcome',    -- process | outcome | strategic
    targetValue REAL NOT NULL DEFAULT 0,
    targetUnit TEXT NOT NULL DEFAULT '%',
    weight REAL NOT NULL DEFAULT 0,
    description TEXT,                            -- penjelasan cara ukur
    measureSource TEXT,                          -- sumber data pengukuran
    periodType TEXT DEFAULT 'bulanan',           -- bulanan | kuartalan | semesteran | tahunan
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
