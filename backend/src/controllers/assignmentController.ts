import { Request, Response, NextFunction } from 'express';
import { assignmentService } from '../services/assignmentService.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';
import { gradeSubmissionSchema } from '../validators/index.ts';

export class AssignmentController {
  async getAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.studentId;
      const courseId = req.query.course_id as string;
      const assignments = await assignmentService.getAssignmentsForStudent(studentId || '', courseId);
      return sendSuccess(res, assignments);
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const studentId = req.user?.studentId;
      const assignment = await assignmentService.getAssignmentDetails(id, studentId);
      return sendSuccess(res, assignment);
    } catch (error) {
      next(error);
    }
  }

  async submitAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const studentId = req.user!.studentId!;
      const file = req.file;

      if (!file) {
        return sendError(res, 'File tugas wajib dilampirkan.', 400);
      }

      const ip = req.ip || req.socket.remoteAddress;
      const submission = await assignmentService.submitAssignment({
        assignmentId: id,
        studentId,
        fileBuffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        ipAddress: ip,
      });

      return sendSuccess(res, submission, 201, 'Tugas berhasil dikumpulkan');
    } catch (error) {
      next(error);
    }
  }

  async gradeSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { submissionId } = req.params;
      const validated = gradeSubmissionSchema.parse(req.body);
      const graded = await assignmentService.gradeSubmission(
        submissionId,
        validated.score,
        validated.feedback,
        req.user?.id
      );
      return sendSuccess(res, graded, 200, 'Nilai tugas berhasil disimpan');
    } catch (error) {
      next(error);
    }
  }
}

export const assignmentController = new AssignmentController();
