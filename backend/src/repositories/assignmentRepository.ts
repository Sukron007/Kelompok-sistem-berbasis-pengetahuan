import { prisma } from '../config/database.ts';
import { Prisma } from '@prisma/client';

export class AssignmentRepository {
  async findAll(params: { courseId?: string; studentId?: string; search?: string }) {
    const where: Prisma.AssignmentWhereInput = {};

    if (params.courseId) {
      where.course_id = params.courseId;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    return prisma.assignment.findMany({
      where,
      include: {
        course: true,
        submissions: params.studentId
          ? {
              where: { student_id: params.studentId },
            }
          : {
              include: {
                student: {
                  select: { id: true, student_number: true, full_name: true },
                },
              },
            },
      },
      orderBy: { deadline: 'asc' },
    });
  }

  async findById(id: string, studentId?: string) {
    return prisma.assignment.findUnique({
      where: { id },
      include: {
        course: true,
        submissions: studentId
          ? {
              where: { student_id: studentId },
            }
          : {
              include: {
                student: {
                  select: { id: true, student_number: true, full_name: true },
                },
              },
            },
      },
    });
  }

  async create(data: {
    course_id: string;
    title: string;
    description: string;
    instructions?: string | null;
    deadline: Date;
    attachment_url?: string | null;
  }) {
    return prisma.assignment.create({
      data,
      include: { course: true },
    });
  }

  async update(id: string, data: Prisma.AssignmentUpdateInput) {
    return prisma.assignment.update({
      where: { id },
      data,
      include: { course: true },
    });
  }

  async findSubmission(assignmentId: string, studentId: string) {
    return prisma.assignmentSubmission.findUnique({
      where: {
        assignment_id_student_id: {
          assignment_id: assignmentId,
          student_id: studentId,
        },
      },
      include: {
        assignment: {
          include: { course: true },
        },
      },
    });
  }

  async upsertSubmission(data: {
    assignment_id: string;
    student_id: string;
    file_url: string;
    file_name?: string | null;
    status: string;
  }) {
    return prisma.assignmentSubmission.upsert({
      where: {
        assignment_id_student_id: {
          assignment_id: data.assignment_id,
          student_id: data.student_id,
        },
      },
      update: {
        file_url: data.file_url,
        file_name: data.file_name,
        submitted_at: new Date(),
        status: data.status,
      },
      create: {
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        file_url: data.file_url,
        file_name: data.file_name,
        submitted_at: new Date(),
        status: data.status,
      },
      include: {
        assignment: { include: { course: true } },
      },
    });
  }

  async gradeSubmission(submissionId: string, score: number, feedback?: string) {
    return prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
        status: 'DINILAI',
      },
      include: {
        student: true,
        assignment: true,
      },
    });
  }
}

export const assignmentRepository = new AssignmentRepository();
