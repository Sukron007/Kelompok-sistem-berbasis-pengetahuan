import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.ts';
import authRoutes from './authRoutes.ts';
import studentRoutes from './studentRoutes.ts';
import academicRoutes from './academicRoutes.ts';
import assignmentRoutes from './assignmentRoutes.ts';
import billRoutes from './billRoutes.ts';
import paymentRoutes from './paymentRoutes.ts';
import notificationRoutes from './notificationRoutes.ts';
import adminRoutes from './adminRoutes.ts';

const router = Router();

// Section 45: Health Check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      data: {
        api: 'ok',
        database: 'connected',
      },
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      data: {
        api: 'ok',
        database: 'disconnected',
      },
    });
  }
});

// Mounted sub-routes
router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/students', studentRoutes);
router.use('/academic', academicRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/bills', billRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
