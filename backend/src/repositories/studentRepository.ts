import { prisma } from '../config/database.ts';
import { Student, Prisma } from '@prisma/client';

export class StudentRepository {
  async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true, is_active: true } },
        faculty: true,
        study_program: true,
        academic_year: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        user: { select: { email: true, role: true, is_active: true } },
        faculty: true,
        study_program: true,
        academic_year: true,
      },
    });
  }

  async findByStudentNumber(studentNumber: string) {
    return prisma.student.findUnique({
      where: { student_number: studentNumber },
      include: {
        user: { select: { email: true, role: true, is_active: true } },
        faculty: true,
        study_program: true,
        academic_year: true,
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    studyProgramId?: string;
    facultyId?: string;
    isActive?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {};

    if (params.search) {
      where.OR = [
        { full_name: { contains: params.search } },
        { student_number: { contains: params.search } },
        { user: { email: { contains: params.search } } },
      ];
    }

    if (params.studyProgramId) {
      where.study_program_id = params.studyProgramId;
    }

    if (params.facultyId) {
      where.faculty_id = params.facultyId;
    }

    if (params.isActive !== undefined) {
      where.is_active = params.isActive;
    }

    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { email: true, is_active: true } },
          faculty: { select: { code: true, name: true } },
          study_program: { select: { code: true, name: true } },
          academic_year: { select: { name: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: Prisma.StudentCreateInput) {
    return prisma.student.create({ data });
  }

  async update(id: string, data: Prisma.StudentUpdateInput) {
    return prisma.student.update({
      where: { id },
      data,
    });
  }

  async hasFinancialRecords(id: string): Promise<boolean> {
    const [billCount, paymentCount] = await Promise.all([
      prisma.bill.count({ where: { student_id: id } }),
      prisma.payment.count({ where: { student_id: id } }),
    ]);
    return billCount > 0 || paymentCount > 0;
  }
}

export const studentRepository = new StudentRepository();
