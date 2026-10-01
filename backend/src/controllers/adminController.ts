import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService.ts';
import { academicRepository } from '../repositories/academicRepository.ts';
import { notificationService } from '../services/notificationService.ts';
import { billService } from '../services/billService.ts';
import {
  createStudentSchema,
  updateStudentSchema,
  createCourseSchema,
  createScheduleSchema,
  createBillSchema,
  createNotificationSchema,
  createFacultySchema,
  createStudyProgramSchema,
} from '../validators/index.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  // Student Management
  async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string;
      const studyProgramId = req.query.study_program_id as string;
      const facultyId = req.query.faculty_id as string;
      const isActive = req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined;

      const result = await adminService.getStudents({
        page,
        limit,
        search,
        studyProgramId,
        facultyId,
        isActive,
      });

      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStudentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const student = await adminService.getStudentById(id);
      return sendSuccess(res, student);
    } catch (error) {
      next(error);
    }
  }

  async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createStudentSchema.parse(req.body);
      const student = await adminService.createStudent(validated, req.user?.id);
      return sendSuccess(res, student, 201, 'Data mahasiswa berhasil dibuat');
    } catch (error) {
      next(error);
    }
  }

  async updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateStudentSchema.parse(req.body);
      const student = await adminService.updateStudent(id, validated, req.user?.id);
      return sendSuccess(res, student, 200, 'Data mahasiswa berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  async deleteOrDeactivateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteOrDeactivateStudent(id, req.user?.id);
      return sendSuccess(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Course Management
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCourseSchema.parse(req.body);
      const course = await adminService.createCourse(validated);
      return sendSuccess(res, course, 201, 'Mata kuliah berhasil ditambahkan');
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await adminService.updateCourse(id, req.body);
      return sendSuccess(res, course, 200, 'Mata kuliah berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  // Schedule Management
  async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createScheduleSchema.parse(req.body);
      const schedule = await adminService.createSchedule(validated);
      return sendSuccess(res, schedule, 201, 'Jadwal kuliah berhasil dibuat');
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await adminService.updateSchedule(id, req.body);
      return sendSuccess(res, schedule, 200, 'Jadwal kuliah berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteSchedule(id);
      return sendSuccess(res, { deleted: true }, 200, 'Jadwal kuliah berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }

  // Faculty & Study Program Management
  async createFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createFacultySchema.parse(req.body);
      const faculty = await academicRepository.createFaculty(validated);
      return sendSuccess(res, faculty, 201, 'Fakultas berhasil ditambahkan');
    } catch (error) {
      next(error);
    }
  }

  async createStudyProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createStudyProgramSchema.parse(req.body);
      const program = await academicRepository.createStudyProgram(validated);
      return sendSuccess(res, program, 201, 'Program studi berhasil ditambahkan');
    } catch (error) {
      next(error);
    }
  }

  // Bill & Payments
  async getBills(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const bills = await adminService.getBills({ page, limit, status, search });
      return sendSuccess(res, bills);
    } catch (error) {
      next(error);
    }
  }

  async createBill(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createBillSchema.parse(req.body);
      const bill = await billService.createBill(validated);
      return sendSuccess(res, bill, 201, 'Tagihan SPP berhasil diterbitkan');
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const payments = await adminService.getPayments({ page, limit, status, search });
      return sendSuccess(res, payments);
    } catch (error) {
      next(error);
    }
  }

  // Notifications
  async broadcastNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createNotificationSchema.parse(req.body);
      const notification = await notificationService.createNotification(validated);
      return sendSuccess(res, notification, 201, 'Pengumuman / Notifikasi berhasil dikirim');
    } catch (error) {
      next(error);
    }
  }

  // Audit Logs
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await adminService.getAuditLogs(100);
      return sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
