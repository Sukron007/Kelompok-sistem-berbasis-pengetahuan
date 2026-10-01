import { Router } from 'express';
import { adminController } from '../controllers/adminController.ts';
import { authenticateJwt, requireRole } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(['ADMIN']));

// Dashboard
router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));

// Students
router.get('/students', (req, res, next) => adminController.getStudents(req, res, next));
router.get('/students/:id', (req, res, next) => adminController.getStudentById(req, res, next));
router.post('/students', (req, res, next) => adminController.createStudent(req, res, next));
router.patch('/students/:id', (req, res, next) => adminController.updateStudent(req, res, next));
router.delete('/students/:id', (req, res, next) => adminController.deleteOrDeactivateStudent(req, res, next));

// Academic master data
router.post('/faculties', (req, res, next) => adminController.createFaculty(req, res, next));
router.post('/study-programs', (req, res, next) => adminController.createStudyProgram(req, res, next));
router.post('/courses', (req, res, next) => adminController.createCourse(req, res, next));
router.patch('/courses/:id', (req, res, next) => adminController.updateCourse(req, res, next));
router.post('/schedules', (req, res, next) => adminController.createSchedule(req, res, next));
router.patch('/schedules/:id', (req, res, next) => adminController.updateSchedule(req, res, next));
router.delete('/schedules/:id', (req, res, next) => adminController.deleteSchedule(req, res, next));

// SPP Bills & Payments
router.get('/bills', (req, res, next) => adminController.getBills(req, res, next));
router.post('/bills', (req, res, next) => adminController.createBill(req, res, next));
router.get('/payments', (req, res, next) => adminController.getPayments(req, res, next));

// Notifications & Announcements
router.post('/notifications', (req, res, next) => adminController.broadcastNotification(req, res, next));

// Audit Logs
router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));

export default router;
