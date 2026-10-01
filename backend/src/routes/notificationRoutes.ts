import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.ts';
import { authenticateJwt, requireRole } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(['MAHASISWA']));

router.get('/', (req, res, next) => notificationController.getNotifications(req, res, next));
router.patch('/read-all', (req, res, next) => notificationController.markAllAsRead(req, res, next));
router.patch('/:id/read', (req, res, next) => notificationController.markAsRead(req, res, next));

export default router;
