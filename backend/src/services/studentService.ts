import { studentRepository } from '../repositories/studentRepository.ts';
import { billRepository } from '../repositories/billRepository.ts';
import { scheduleRepository } from '../repositories/scheduleRepository.ts';
import { assignmentRepository } from '../repositories/assignmentRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { prisma } from '../config/database.ts';
import { storageService } from './storageService.ts';

export class StudentService {
  async getProfile(studentId: string) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw { statusCode: 404, message: 'Data mahasiswa tidak ditemukan.' };
    }
    return student;
  }

  async updateProfile(studentId: string, data: { phone?: string | null; address?: string | null; photo_url?: string | null }) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw { statusCode: 404, message: 'Data mahasiswa tidak ditemukan.' };
    }

    return studentRepository.update(studentId, {
      phone: data.phone,
      address: data.address,
      photo_url: data.photo_url,
    });
  }

  async uploadProfilePhoto(studentId: string, fileBuffer: Buffer, originalName: string, mimeType: string) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw { statusCode: 404, message: 'Data mahasiswa tidak ditemukan.' };
    }

    const saved = storageService.saveBuffer(fileBuffer, originalName, mimeType);
    return studentRepository.update(studentId, {
      photo_url: saved.publicUrl,
    });
  }

  async getDashboard(studentId: string) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw { statusCode: 404, message: 'Data mahasiswa tidak ditemukan.' };
    }

    // 1. Get Active SPP Bill
    const bills = await billRepository.findByStudentId(studentId);
    const activeUnpaidBill = bills.find((b) => b.status === 'UNPAID' || b.status === 'PENDING') || null;

    // 2. Get today's day of week in Indonesian
    const daysIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = daysIndonesian[new Date().getDay()];

    const allSchedules = await scheduleRepository.findAll();
    // Classes for today (or fallback to active classes if Sunday)
    const todaySchedules = allSchedules.filter((s) => s.day_of_week === currentDayName);

    // 3. Get Upcoming Assignments
    const assignments = await assignmentRepository.findAll({ studentId });
    const now = new Date();
    const upcomingAssignments = assignments
      .filter((a) => new Date(a.deadline) > now)
      .slice(0, 5);

    // 4. Counts
    const unsubmittedAssignmentsCount = assignments.filter((a) => {
      const sub = a.submissions && a.submissions.length > 0 ? a.submissions[0] : null;
      return !sub || sub.status === 'BELUM_DIKERJAKAN';
    }).length;

    // 5. Total SKS enrolled
    const totalCredits = (await prisma.course.findMany({ where: { is_active: true } }))
      .reduce((sum, c) => sum + c.credits, 0);

    // 6. Recent unread notifications count
    const notifications = await notificationRepository.findForStudent(studentId, 10);
    const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

    return {
      student: {
        id: student.id,
        student_number: student.student_number,
        full_name: student.full_name,
        photo_url: student.photo_url,
        semester: student.semester,
        study_program: student.study_program.name,
        faculty: student.faculty.name,
        academic_year: student.academic_year.name,
      },
      stats: {
        sppBillAmount: activeUnpaidBill ? activeUnpaidBill.amount : 0,
        sppBillStatus: activeUnpaidBill ? activeUnpaidBill.status : 'PAID',
        assignmentsCount: unsubmittedAssignmentsCount,
        todayClassesCount: todaySchedules.length,
        totalCredits,
        unreadNotificationsCount,
      },
      activeBill: activeUnpaidBill,
      todaySchedules: todaySchedules.length > 0 ? todaySchedules : allSchedules.slice(0, 3), // Show first 3 if none today
      upcomingAssignments,
      recentNotifications: notifications.slice(0, 3),
    };
  }
}

export const studentService = new StudentService();
