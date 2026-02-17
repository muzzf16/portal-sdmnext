-- Migration: Add status and attendance summary columns to penggajian table
-- Date: 2026-02-17

ALTER TABLE penggajian ADD COLUMN status TEXT CHECK(status IN ('Draft', 'Final', 'Paid')) DEFAULT 'Draft';
ALTER TABLE penggajian ADD COLUMN totalAttendance INTEGER DEFAULT 0;
ALTER TABLE penggajian ADD COLUMN totalOvertime INTEGER DEFAULT 0;
ALTER TABLE penggajian ADD COLUMN totalLateness INTEGER DEFAULT 0;
