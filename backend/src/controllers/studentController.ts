import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/studentService.ts';
import { updateProfileSchema } from '../validators/index.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';

export class StudentController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const data = await studentService.getDashboard(studentId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const profile = await studentService.getProfile(studentId);
      return sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const validated = updateProfileSchema.parse(req.body);
      const updated = await studentService.updateProfile(studentId, validated);
      return sendSuccess(res, updated, 200, 'Profil berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const file = req.file;
      if (!file) {
        return sendError(res, 'File foto profil wajib disertakan.', 400);
      }
      const updated = await studentService.uploadProfilePhoto(
        studentId,
        file.buffer,
        file.originalname,
        file.mimetype
      );
      return sendSuccess(res, updated, 200, 'Foto profil berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
