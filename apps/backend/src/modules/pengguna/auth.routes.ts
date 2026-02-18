
import { Router } from 'express';
import AuthPenggunaController from './auth.pengguna.controller';

const router = Router();

router.post('/login', AuthPenggunaController.login);
router.post('/register', AuthPenggunaController.register);

export default router;
