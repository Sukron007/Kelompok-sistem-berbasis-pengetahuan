import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { authenticateJwt } from '../middleware/auth.ts';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.get('/me', authenticateJwt, (req, res, next) => authController.getMe(req, res, next));

export default router;
