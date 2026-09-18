import { Router } from 'express';
import { register, login, getMe, logout, seedAdmin } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);
router.all('/seed-admin', seedAdmin);

export default router;
