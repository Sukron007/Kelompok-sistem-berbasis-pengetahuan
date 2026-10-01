import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const notifications = await notificationService.getStudentNotifications(studentId);
      return sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const studentId = req.user!.studentId!;
      const read = await notificationService.markAsRead(id, studentId);
      return sendSuccess(res, read, 200, 'Notifikasi ditandai sudah dibaca');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      await notificationService.markAllAsRead(studentId);
      return sendSuccess(res, { markedAll: true }, 200, 'Semua notifikasi ditandai sudah dibaca');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
