import { notificationRepository } from '../repositories/notificationRepository.ts';

export class NotificationService {
  async getStudentNotifications(studentId: string) {
    return notificationRepository.findForStudent(studentId);
  }

  async markAsRead(notificationId: string, studentId: string) {
    return notificationRepository.markAsRead(notificationId, studentId);
  }

  async markAllAsRead(studentId: string) {
    return notificationRepository.markAllAsRead(studentId);
  }

  async createNotification(data: {
    title: string;
    message: string;
    type: string;
    target_student_id?: string | null;
  }) {
    return notificationRepository.create(data);
  }
}

export const notificationService = new NotificationService();
