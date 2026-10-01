import { prisma } from '../config/database.ts';
import { Prisma } from '@prisma/client';

export class CourseRepository {
  async findAll(params: { search?: string; isActive?: boolean }) {
    const where: Prisma.CourseWhereInput = {};
    if (params.search) {
      where.OR = [
        { code: { contains: params.search } },
        { name: { contains: params.search } },
      ];
    }
    if (params.isActive !== undefined) {
      where.is_active = params.isActive;
    }
    return prisma.course.findMany({
      where,
      include: {
        schedules: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: { schedules: true, assignments: true },
    });
  }

  async create(data: { code: string; name: string; credits: number; description?: string | null }) {
    return prisma.course.create({ data });
  }

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
    });
  }
}

export const courseRepository = new CourseRepository();
