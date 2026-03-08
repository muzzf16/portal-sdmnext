// src/modules/kpi/kpiTemplate.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { openDb } from '../../config/db';

const router = Router();

// GET /api/kpi-templates — list all templates, optional filter by department
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const db = await openDb();
        const { department } = req.query;

        let rows;
        if (department) {
            rows = await db.all(
                'SELECT * FROM kpi_templates WHERE department = ? ORDER BY weight DESC',
                department
            );
        } else {
            rows = await db.all('SELECT * FROM kpi_templates ORDER BY department, weight DESC');
        }

        // Group by department for easier frontend consumption
        const departments = await db.all(
            'SELECT DISTINCT department FROM kpi_templates ORDER BY department'
        );

        res.json({
            success: true,
            data: rows,
            departments: departments.map((d: any) => d.department),
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/kpi-templates/apply — apply templates to employee for a period
router.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employeeId, period, department, templateIds } = req.body;

        if (!employeeId || !period) {
            return res.status(400).json({ success: false, message: 'employeeId dan period wajib diisi' });
        }

        const db = await openDb();

        // Get templates — either by specific IDs or by department
        let templates: any[];
        if (templateIds && templateIds.length > 0) {
            const placeholders = templateIds.map(() => '?').join(',');
            templates = await db.all(
                `SELECT * FROM kpi_templates WHERE id IN (${placeholders})`,
                ...templateIds
            );
        } else if (department) {
            templates = await db.all(
                'SELECT * FROM kpi_templates WHERE department = ?',
                department
            );
        } else {
            return res.status(400).json({ success: false, message: 'Pilih department atau templateIds' });
        }

        if (templates.length === 0) {
            return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
        }

        // Check existing KPIs for this employee+period to avoid duplicates
        const existingKpis = await db.all(
            'SELECT kpiName FROM kpi_targets WHERE employeeId = ? AND period = ?',
            employeeId, period
        );
        const existingNames = new Set(existingKpis.map((k: any) => k.kpiName.toLowerCase()));

        const created: any[] = [];
        const skipped: string[] = [];

        for (const tpl of templates) {
            if (existingNames.has(tpl.kpiName.toLowerCase())) {
                skipped.push(tpl.kpiName);
                continue;
            }

            const id = `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();

            // Adjust target for period type
            let targetValue = tpl.targetValue;
            if (tpl.periodType === 'tahunan' && period.match(/-S[12]$/i)) {
                targetValue = Math.ceil(tpl.targetValue / 2);
            } else if (tpl.periodType === 'tahunan' && period.match(/-Q[1-4]$/i)) {
                targetValue = Math.ceil(tpl.targetValue / 4);
            } else if (tpl.periodType === 'semesteran' && period.match(/-Q[1-4]$/i)) {
                targetValue = Math.ceil(tpl.targetValue / 2);
            }

            await db.run(
                `INSERT INTO kpi_targets (id, employeeId, period, kpiName, targetValue, targetUnit, weight, actualValue, score, status, source, category, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'active', 'manual', ?, ?, ?, ?)`,
                id, employeeId, period, tpl.kpiName,
                targetValue, tpl.targetUnit, tpl.weight,
                tpl.category, `Dari template: ${tpl.description || ''}`,
                now, now
            );

            created.push({ id, kpiName: tpl.kpiName, targetValue, weight: tpl.weight, category: tpl.category });
        }

        res.json({
            success: true,
            data: {
                created: created.length,
                skipped: skipped.length,
                skippedNames: skipped,
                details: created,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
