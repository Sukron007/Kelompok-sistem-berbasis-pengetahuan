import { Router } from 'express';
import { studentController } from '../controllers/studentController.ts';
import { authenticateJwt, requireStudent } from '../middleware/auth.ts';
import { uploadMiddleware, handleUploadError } from '../middleware/upload.ts';

const router = Router();

router.use(authenticateJwt);
router.use(requireStudent);

router.get('/dashboard', (req, res, next) => studentController.getDashboard(req, res, next));
router.get('/profile', (req, res, next) => studentController.getProfile(req, res, next));
router.put('/profile', (req, res, next) => studentController.updateProfile(req, res, next));
router.post(
  '/profile/photo',
  uploadMiddleware.single('photo'),
  handleUploadError,
  (req: any, res: any, next: any) => studentController.uploadPhoto(req, res, next)
);

export default router;
