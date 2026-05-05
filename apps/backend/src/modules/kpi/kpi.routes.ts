import { Router } from 'express';
import KpiController from './kpi.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';
import { uploadDocument } from '../../middleware/uploadMiddleware';
import { KpiNominalTargetService } from './kpi-nominal-target.service';

const router = Router();

router.use(authenticateToken);

router.get('/summary', restrictTo('admin', 'supervisor'), KpiController.getSummary);
router.get('/monitoring-summary', restrictTo('admin', 'supervisor'), KpiController.getMonitoringSummary);
router.get('/', KpiController.getAll);
router.get('/employee/:employeeId', KpiController.getByEmployeeId);

// ── Nominal KPI Targets (per-employee configurable targets for NPL/Kredit/Dana) ──
// MUST be before /:id to prevent route conflict
router.get('/nominal-targets', async (req, res, next) => {
    try {
        const data = await KpiNominalTargetService.getAll();
        return res.json({ success: true, data });
    } catch (err) { return next(err); }
});

router.get('/nominal-targets/defaults', async (_req, res) => {
    return res.json({ success: true, data: KpiNominalTargetService.getDefaults() });
});

router.get('/nominal-targets/employee/:employeeId', async (req, res, next) => {
    try {
        const data = await KpiNominalTargetService.getByEmployeeId(req.params.employeeId);
        return res.json({ success: true, data });
    } catch (err) { return next(err); }
});

router.get('/nominal-targets/batch', async (req, res, next) => {
    try {
        const ids = (req.query.ids as string || '').split(',').filter(Boolean);
        const data = await KpiNominalTargetService.getByEmployeeIds(ids);
        return res.json({ success: true, data });
    } catch (err) { return next(err); }
});

router.put('/nominal-targets/employee/:employeeId', restrictTo('admin'), async (req: any, res, next) => {
    try {
        const { employeeId } = req.params;
        const { npl, kredit, dana } = req.body;
        const updatedBy = req.user?.id || req.user?.email || 'admin';
        const data = await KpiNominalTargetService.bulkUpsert(employeeId, { npl, kredit, dana }, String(updatedBy));
        return res.json({ success: true, data, message: 'Target nominal berhasil disimpan' });
    } catch (err) { return next(err); }
});

// ── Standard KPI CRUD (/:id routes must come AFTER named routes) ──
router.get('/:id', KpiController.getById);
router.post('/', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.create);
router.post('/generate-from-abk', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.generateFromAbk);
router.post('/rebalance', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.rebalanceWeights);
router.post('/sync-wla', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.syncRealisasiFromWla);
router.put('/:id', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.update);
router.put('/:id/actual', restrictTo('admin', 'pimpinan', 'supervisor', 'employee'), uploadDocument.single('evidence'), KpiController.updateActualValue);
router.post('/:id/evidence', restrictTo('admin', 'pimpinan', 'supervisor'), uploadDocument.single('evidence'), KpiController.uploadEvidence);
router.delete('/:id', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.delete);

export default router;
