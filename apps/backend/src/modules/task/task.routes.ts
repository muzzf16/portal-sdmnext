import { NextFunction, Request, Response, Router } from 'express';
import { TaskController } from './task.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';
import { TaskRepository } from './task.repository';

const router = Router();

const MANAGER_ROLES = ['admin', 'pimpinan', 'supervisor'] as const;

const getRequestActorId = (req: Request) => String(req.user?.employeeId || req.user?.id || '');

const ensureSupervisorScope = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === 'supervisor' && req.params.supervisor_id !== getRequestActorId(req)) {
        return res.status(403).json({ success: false, message: 'Anda hanya dapat mengakses tugas bawahan Anda sendiri' });
    }
    return next();
};

const ensureEmployeeScope = (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (userRole === 'employee' && req.params.employee_id !== getRequestActorId(req)) {
        return res.status(403).json({ success: false, message: 'Anda hanya dapat mengakses tugas milik Anda sendiri' });
    }
    return next();
};

const ensureTaskCreateScope = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === 'supervisor') {
        req.body.supervisor_id = getRequestActorId(req);
    }
    return next();
};

const ensureTaskStatusScope = async (req: Request, res: Response, next: NextFunction) => {
    const task = await TaskRepository.findById(req.params.id);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const actorId = getRequestActorId(req);
    const userRole = req.user?.role;
    const nextStatus = String(req.body?.status || '');

    if (userRole === 'employee') {
        if (String(task.employee_id) !== actorId) {
            return res.status(403).json({ success: false, message: 'Anda tidak dapat mengubah tugas milik pegawai lain' });
        }

        if (!['completed'].includes(nextStatus)) {
            return res.status(403).json({ success: false, message: 'Pegawai hanya dapat menandai tugas sebagai completed' });
        }

        return next();
    }

    if (userRole === 'supervisor' && String(task.supervisor_id) !== actorId) {
        return res.status(403).json({ success: false, message: 'Anda hanya dapat mengubah tugas yang Anda buat' });
    }

    if (MANAGER_ROLES.includes((userRole || '') as typeof MANAGER_ROLES[number])) {
        return next();
    }

    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
};

const ensureTaskDeleteScope = async (req: Request, res: Response, next: NextFunction) => {
    const task = await TaskRepository.findById(req.params.id);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const actorId = getRequestActorId(req);
    if (req.user?.role === 'supervisor' && String(task.supervisor_id) !== actorId) {
        return res.status(403).json({ success: false, message: 'Anda hanya dapat menghapus tugas yang Anda buat' });
    }

    return next();
};

router.use(authenticateToken);

router.post('/', restrictTo(...MANAGER_ROLES), ensureTaskCreateScope, TaskController.create);
router.get('/supervisor/:supervisor_id', restrictTo(...MANAGER_ROLES), ensureSupervisorScope, TaskController.getBySupervisor);
router.get('/employee/:employee_id', restrictTo('admin', 'pimpinan', 'supervisor', 'employee'), ensureEmployeeScope, TaskController.getByEmployee);
router.put('/:id/status', restrictTo('admin', 'pimpinan', 'supervisor', 'employee'), ensureTaskStatusScope, TaskController.updateStatus);
router.delete('/:id', restrictTo(...MANAGER_ROLES), ensureTaskDeleteScope, TaskController.delete);

export default router;
