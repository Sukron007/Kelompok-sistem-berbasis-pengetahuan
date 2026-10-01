import { Router } from 'express';
import { assignmentController } from '../controllers/assignmentController.ts';
import { authenticateJwt, requireRole } from '../middleware/auth.ts';
import { uploadMiddleware, handleUploadError } from '../middleware/upload.ts';

const router = Router();

router.use(authenticateJwt);

router.get('/', (req, res, next) => assignmentController.getAssignments(req, res, next));
router.get('/:id', (req, res, next) => assignmentController.getAssignmentById(req, res, next));

// Student submission
router.post(
  '/:id/submission',
  requireRole(['MAHASISWA']),
  uploadMiddleware.single('file'),
  handleUploadError,
  (req: any, res: any, next: any) => assignmentController.submitAssignment(req, res, next)
);

// Admin grading
router.patch(
  '/submissions/:submissionId/grade',
  requireRole(['ADMIN']),
  (req, res, next) => assignmentController.gradeSubmission(req, res, next)
);

export default router;
