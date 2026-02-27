import { Router } from 'express';
import { TaskController } from './task.controller';

const router = Router();

router.post('/', TaskController.create);
router.get('/supervisor/:supervisor_id', TaskController.getBySupervisor);
router.get('/employee/:employee_id', TaskController.getByEmployee);
router.put('/:id/status', TaskController.updateStatus);
router.delete('/:id', TaskController.delete);

export default router;
