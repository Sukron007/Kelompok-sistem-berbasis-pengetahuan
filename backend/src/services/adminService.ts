import { prisma } from '../config/database.ts';
import bcrypt from 'bcryptjs';
import { studentRepository } from '../repositories/studentRepository.ts';
import { courseRepository } from '../repositories/courseRepository.ts';
import { scheduleRepository } from '../repositories/scheduleRepository.ts';
import { billRepository } from '../repositories/billRepository.ts';
import { paymentRepository } from '../repositories/paymentRepository.ts';
import { logAuditEvent } from '../middleware/audit.ts';

export class AdminService {
  /**
   * Admin Dashboard Real Statistics
   */
  async getDashboardStats() {
    const [
      totalStudents,
      totalActiveStudents,
      totalUnpaidBills,
      totalPaidBills,
      totalCourses,
      recentPayments,
      recentStudents,
      totalRevenueAggregate,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { is_active: true } }),
      prisma.bill.count({ where: { status: 'UNPAID' } }),
      prisma.bill.count({ where: { status: 'PAID' } }),
      prisma.course.count({ where: { is_active: true } }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          student: { select: { student_number: true, full_name: true } },
          bill: { select: { semester: true, bill_type: true } },
          receipt: true,
        },
      }),
      prisma.student.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          study_program: { select: { name: true } },
          academic_year: { select: { name: true } },
        },
      }),
      prisma.payment.aggregate({
        where: {
          transaction_status: { in: ['settlement', 'capture'] },
        },
        _sum: {
          gross_amount: true,
        },
      }),
    ]);

    return {
      totalStudents,
      totalActiveStudents,
      totalUnpaidBills,
      totalPaidBills,
      totalCourses,
      totalRevenue: totalRevenueAggregate._sum.gross_amount || 0,
      recentPayments,
      recentStudents,
    };
  }

  /**
   * Student Management
   */
  async getStudents(params: {
    page?: number;
    limit?: number;
    search?: string;
    studyProgramId?: string;
    facultyId?: string;
    isActive?: boolean;
  }) {
    return studentRepository.findAll(params);
  }

  async getStudentById(id: string) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw { statusCode: 404, message: 'Mahasiswa tidak ditemukan.' };
    }
    return student;
  }

  async createStudent(data: {
    email: string;
    password: string;
    student_number: string;
    full_name: string;
    phone?: string | null;
    address?: string | null;
    faculty_id: string;
    study_program_id: string;
    academic_year_id: string;
    semester: number;
  }, adminUserId?: string) {
    // Check existing email
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw { statusCode: 409, message: 'Email sudah terdaftar.' };
    }

    // Check existing student_number
    const existingNim = await prisma.student.findUnique({ where: { student_number: data.student_number } });
    if (existingNim) {
      throw { statusCode: 409, message: 'Nomor Induk Mahasiswa (NIM) sudah terdaftar.' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password_hash: passwordHash,
          role: 'MAHASISWA',
          is_active: true,
        },
      });

      const student = await tx.student.create({
        data: {
          user_id: user.id,
          student_number: data.student_number,
          full_name: data.full_name,
          phone: data.phone,
          address: data.address,
          faculty_id: data.faculty_id,
          study_program_id: data.study_program_id,
          academic_year_id: data.academic_year_id,
          semester: data.semester,
          is_active: true,
        },
        include: {
          study_program: true,
          faculty: true,
          academic_year: true,
        },
      });

      return student;
    });

    await logAuditEvent({
      userId: adminUserId,
      action: 'STUDENT_CREATED',
      entity: 'STUDENT',
      entityId: result.id,
      details: `Created student ${result.student_number} - ${result.full_name}`,
    });

    return result;
  }

  async updateStudent(id: string, data: any, adminUserId?: string) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw { statusCode: 404, message: 'Mahasiswa tidak ditemukan.' };
    }

    const updated = await studentRepository.update(id, data);

    await logAuditEvent({
      userId: adminUserId,
      action: 'STUDENT_UPDATED',
      entity: 'STUDENT',
      entityId: id,
      details: `Updated student ${student.student_number}`,
    });

    return updated;
  }

  /**
   * Delete or Deactivate student according to Rule 78
   * "If student has bills/payments, do not delete. Prefer deactivation."
   */
  async deleteOrDeactivateStudent(id: string, adminUserId?: string) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw { statusCode: 404, message: 'Mahasiswa tidak ditemukan.' };
    }

    const hasFinancials = await studentRepository.hasFinancialRecords(id);

    if (hasFinancials) {
      // Deactivate instead of delete
      await prisma.$transaction([
        prisma.student.update({
          where: { id },
          data: { is_active: false },
        }),
        prisma.user.update({
          where: { id: student.user_id },
          data: { is_active: false },
        }),
      ]);

      await logAuditEvent({
        userId: adminUserId,
        action: 'STUDENT_DEACTIVATED',
        entity: 'STUDENT',
        entityId: id,
        details: `Student ${student.student_number} has financial history. Deactivated instead of deleted.`,
      });

      return {
        deactivated: true,
        message: 'Mahasiswa memiliki riwayat keuangan/SPP. Akun berhasil dinonaktifkan (arsip) demi kepatuhan audit.',
      };
    } else {
      // Safe to cascade delete because no financial history
      await prisma.user.delete({
        where: { id: student.user_id },
      });

      await logAuditEvent({
        userId: adminUserId,
        action: 'STUDENT_DELETED',
        entity: 'STUDENT',
        entityId: id,
        details: `Deleted student ${student.student_number} with no financial records.`,
      });

      return {
        deleted: true,
        message: 'Data mahasiswa berhasil dihapus.',
      };
    }
  }

  /**
   * Course & Schedule Management
   */
  async createCourse(data: { code: string; name: string; credits: number; description?: string | null }) {
    return courseRepository.create(data);
  }

  async updateCourse(id: string, data: any) {
    return courseRepository.update(id, data);
  }

  async createSchedule(data: any) {
    return scheduleRepository.create(data);
  }

  async updateSchedule(id: string, data: any) {
    return scheduleRepository.update(id, data);
  }

  async deleteSchedule(id: string) {
    return scheduleRepository.delete(id);
  }

  /**
   * Bills & Payments
   */
  async getBills(params: any) {
    return billRepository.findAll(params);
  }

  async getPayments(params: any) {
    return paymentRepository.findAll(params);
  }

  async getAuditLogs(limit = 100) {
    return prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }
}

export const adminService = new AdminService();
