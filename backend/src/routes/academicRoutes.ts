import { Router } from 'express';
import { academicController } from '../controllers/academicController.ts';
import { authenticateJwt } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateJwt);

router.get('/overview', (req, res, next) => academicController.getStudentAcademicOverview(req, res, next));
router.get('/courses', (req, res, next) => academicController.getCourses(req, res, next));
router.get('/schedules', (req, res, next) => academicController.getSchedules(req, res, next));
router.get('/faculties', (req, res, next) => academicController.getFaculties(req, res, next));
router.get('/study-programs', (req, res, next) => academicController.getStudyPrograms(req, res, next));
router.get('/academic-years', (req, res, next) => academicController.getAcademicYears(req, res, next));

export default router;
