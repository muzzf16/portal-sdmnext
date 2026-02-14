import { Router } from 'express';
import JabatanController from './jabatan.controller';

const router = Router();

// Specific routes before parametric
router.get('/tree', JabatanController.getTree);
router.get('/tree-with-employees', JabatanController.getTreeWithEmployees);
router.get('/level/:level', JabatanController.getByLevel);
router.get('/subordinates/:pegawaiId', JabatanController.getSubordinates);

// CRUD
router.get('/', JabatanController.getAll);
router.get('/:id', JabatanController.getById);
router.post('/', JabatanController.create);
router.put('/:id', JabatanController.update);
router.delete('/:id', JabatanController.delete);

export default router;
