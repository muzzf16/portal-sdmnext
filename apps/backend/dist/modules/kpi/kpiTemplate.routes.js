"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../config/db");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const db = await (0, db_1.openDb)();
        const { department } = req.query;
        let rows;
        if (department) {
            rows = await db.all('SELECT * FROM kpi_templates WHERE department = ? ORDER BY weight DESC', department);
        }
        else {
            rows = await db.all('SELECT * FROM kpi_templates ORDER BY department, weight DESC');
        }
        const departments = await db.all('SELECT DISTINCT department FROM kpi_templates ORDER BY department');
        res.json({
            success: true,
            data: rows,
            departments: departments.map((d) => d.department),
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/apply', async (req, res, next) => {
    try {
        const { employeeId, period, department, templateIds } = req.body;
        if (!employeeId || !period) {
            res.status(400).json({ success: false, message: 'employeeId dan period wajib diisi' });
            return;
        }
        const db = await (0, db_1.openDb)();
        let templates;
        if (templateIds && templateIds.length > 0) {
            const placeholders = templateIds.map(() => '?').join(',');
            templates = await db.all(`SELECT * FROM kpi_templates WHERE id IN (${placeholders})`, ...templateIds);
        }
        else if (department) {
            templates = await db.all('SELECT * FROM kpi_templates WHERE department = ?', department);
        }
        else {
            res.status(400).json({ success: false, message: 'Pilih department atau templateIds' });
            return;
        }
        if (templates.length === 0) {
            res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
            return;
        }
        const existingKpis = await db.all('SELECT kpiName FROM kpi_targets WHERE employeeId = ? AND period = ?', employeeId, period);
        const existingNames = new Set(existingKpis.map((k) => k.kpiName.toLowerCase()));
        const created = [];
        const skipped = [];
        for (const tpl of templates) {
            if (existingNames.has(tpl.kpiName.toLowerCase())) {
                skipped.push(tpl.kpiName);
                continue;
            }
            const id = `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();
            let targetValue = tpl.targetValue;
            if (tpl.periodType === 'tahunan' && period.match(/-S[12]$/i)) {
                targetValue = Math.ceil(tpl.targetValue / 2);
            }
            else if (tpl.periodType === 'tahunan' && period.match(/-Q[1-4]$/i)) {
                targetValue = Math.ceil(tpl.targetValue / 4);
            }
            else if (tpl.periodType === 'semesteran' && period.match(/-Q[1-4]$/i)) {
                targetValue = Math.ceil(tpl.targetValue / 2);
            }
            await db.run(`INSERT INTO kpi_targets (id, employeeId, period, kpiName, targetValue, targetUnit, weight, actualValue, score, status, source, category, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'active', 'manual', ?, ?, ?, ?)`, id, employeeId, period, tpl.kpiName, targetValue, tpl.targetUnit, tpl.weight, tpl.category, `Dari template: ${tpl.description || ''}`, now, now);
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=kpiTemplate.routes.js.map