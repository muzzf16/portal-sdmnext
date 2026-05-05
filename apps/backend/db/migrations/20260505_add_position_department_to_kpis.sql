-- Migration: Add position and department to kpi_targets
-- Date: 2026-05-05

ALTER TABLE kpi_targets ADD COLUMN position TEXT;
ALTER TABLE kpi_targets ADD COLUMN department TEXT;
