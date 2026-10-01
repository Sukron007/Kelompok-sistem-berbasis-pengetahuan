import { prisma } from '../config/database.ts';

export class NotificationRepository {
  async findForStudent(studentId: string, limit = 50) {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { target_student_id: studentId },
          { target_student_id: null }, // broadcast
        ],
      },
      include: {
        reads: {
          where: { student_id: studentId },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      target_student_id: n.target_student_id,
      created_at: n.created_at,
      is_read: n.reads.length > 0,
      read_at: n.reads[0]?.read_at || null,
    }));
  }

  async markAsRead(notificationId: string, studentId: string) {
    return prisma.notificationRead.upsert({
      where: {
        notification_id_student_id: {
          notification_id: notificationId,
          student_id: studentId,
        },
      },
      update: {
        read_at: new Date(),
      },
      create: {
        notification_id: notificationId,
        student_id: studentId,
        read_at: new Date(),
      },
    });
  }

  async markAllAsRead(studentId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { target_student_id: studentId },
          { target_student_id: null },
        ],
      },
      select: { id: true },
    });

    const writes = notifications.map((n) =>
      prisma.notificationRead.upsert({
        where: {
          notification_id_student_id: {
            notification_id: n.id,
            student_id: studentId,
          },
        },
        update: {
          read_at: new Date(),
        },
        create: {
          notification_id: n.id,
          student_id: studentId,
          read_at: new Date(),
        },
      })
    );

    await prisma.$transaction(writes);
    return true;
  }

  async create(data: {
    title: string;
    message: string;
    type: string;
    target_student_id?: string | null;
  }) {
    return prisma.notification.create({
      data,
    });
  }

  async findAll(limit = 100) {
    return prisma.notification.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        reads: true,
      },
    });
  }
}

export const notificationRepository = new NotificationRepository();
