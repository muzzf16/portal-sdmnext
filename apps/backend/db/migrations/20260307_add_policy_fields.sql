-- Migration: Add leave policy and payroll fields to company_settings
-- Date: 2026-03-07
-- Purpose: Support UU 13/2003 compliance for leave quotas and PP 36/2021 for payroll

ALTER TABLE company_settings ADD COLUMN maternityLeaveQuota INTEGER DEFAULT 90;
ALTER TABLE company_settings ADD COLUMN personalLeaveQuota INTEGER DEFAULT 3;
ALTER TABLE company_settings ADD COLUMN carryOverPolicy TEXT DEFAULT 'none';
ALTER TABLE company_settings ADD COLUMN probationMonths INTEGER DEFAULT 12;
ALTER TABLE company_settings ADD COLUMN overtimeMultiplier REAL DEFAULT 1.5;
ALTER TABLE company_settings ADD COLUMN thrPolicy TEXT DEFAULT 'prorata';
