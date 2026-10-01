import { Request, Response, NextFunction } from 'express';
import { academicService } from '../services/academicService.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class AcademicController {
  async getStudentAcademicOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const data = await academicService.getStudentAcademicOverview(studentId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const courses = await academicService.getAllCourses(search);
      return sendSuccess(res, courses);
    } catch (error) {
      next(error);
    }
  }

  async getSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const dayOfWeek = req.query.day as string;
      const schedules = await academicService.getAllSchedules(dayOfWeek);
      return sendSuccess(res, schedules);
    } catch (error) {
      next(error);
    }
  }

  async getFaculties(_req: Request, res: Response, next: NextFunction) {
    try {
      const faculties = await academicService.getFaculties();
      return sendSuccess(res, faculties);
    } catch (error) {
      next(error);
    }
  }

  async getStudyPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const facultyId = req.query.faculty_id as string;
      const programs = await academicService.getStudyPrograms(facultyId);
      return sendSuccess(res, programs);
    } catch (error) {
      next(error);
    }
  }

  async getAcademicYears(_req: Request, res: Response, next: NextFunction) {
    try {
      const years = await academicService.getAcademicYears();
      return sendSuccess(res, years);
    } catch (error) {
      next(error);
    }
  }
}

export const academicController = new AcademicController();
