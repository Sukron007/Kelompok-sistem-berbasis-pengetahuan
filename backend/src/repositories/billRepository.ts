import { prisma } from '../config/database.ts';
import { Prisma } from '@prisma/client';

export class BillRepository {
  async findById(id: string) {
    return prisma.bill.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { email: true } },
            study_program: true,
            faculty: true,
          },
        },
        academic_year: true,
        payments: {
          orderBy: { created_at: 'desc' },
          include: { receipt: true },
        },
      },
    });
  }

  async findByStudentId(studentId: string, params?: { status?: string; semester?: number }) {
    const where: Prisma.BillWhereInput = {
      student_id: studentId,
    };

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.semester) {
      where.semester = params.semester;
    }

    return prisma.bill.findMany({
      where,
      include: {
        academic_year: true,
        payments: {
          orderBy: { created_at: 'desc' },
          include: { receipt: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    studentId?: string;
    search?: string;
    academicYearId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BillWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.studentId) {
      where.student_id = params.studentId;
    }

    if (params.academicYearId) {
      where.academic_year_id = params.academicYearId;
    }

    if (params.search) {
      where.student = {
        OR: [
          { full_name: { contains: params.search } },
          { student_number: { contains: params.search } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              student_number: true,
              full_name: true,
              study_program: { select: { name: true } },
            },
          },
          academic_year: { select: { name: true } },
          payments: {
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.bill.count({ where }),
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

  async create(data: {
    student_id: string;
    academic_year_id: string;
    bill_type: string;
    semester: number;
    amount: number;
    due_date: Date;
    description?: string | null;
  }) {
    return prisma.bill.create({
      data: {
        ...data,
        status: 'UNPAID',
      },
      include: {
        student: true,
        academic_year: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.bill.update({
      where: { id },
      data: { status },
    });
  }
}

export const billRepository = new BillRepository();
