import { prisma } from '../config/database.ts';
import { Prisma } from '@prisma/client';

export class ScheduleRepository {
  async findAll(params?: { dayOfWeek?: string; courseId?: string }) {
    const where: Prisma.CourseScheduleWhereInput = {};
    if (params?.dayOfWeek) {
      where.day_of_week = params.dayOfWeek;
    }
    if (params?.courseId) {
      where.course_id = params.courseId;
    }

    return prisma.courseSchedule.findMany({
      where,
      include: {
        course: true,
      },
      orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }],
    });
  }

  async findById(id: string) {
    return prisma.courseSchedule.findUnique({
      where: { id },
      include: { course: true },
    });
  }

  async create(data: {
    course_id: string;
    lecturer_name: string;
    class_name: string;
    room: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
  }) {
    return prisma.courseSchedule.create({
      data,
      include: { course: true },
    });
  }

  async update(id: string, data: Prisma.CourseScheduleUpdateInput) {
    return prisma.courseSchedule.update({
      where: { id },
      data,
      include: { course: true },
    });
  }

  async delete(id: string) {
    return prisma.courseSchedule.delete({
      where: { id },
    });
  }
}

export const scheduleRepository = new ScheduleRepository();
