-- Migration: Add category field to kpi_targets
-- Date: 2026-03-07
-- Purpose: Categorize KPI as process (from WLA), outcome (manual), or strategic (cascading)

ALTER TABLE kpi_targets ADD COLUMN category TEXT DEFAULT 'process';
