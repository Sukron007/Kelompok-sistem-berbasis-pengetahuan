import { assignmentRepository } from '../repositories/assignmentRepository.ts';
import { storageService } from './storageService.ts';
import { logAuditEvent } from '../middleware/audit.ts';

export class AssignmentService {
  async getAssignmentsForStudent(studentId: string, courseId?: string) {
    return assignmentRepository.findAll({ studentId, courseId });
  }

  async getAssignmentDetails(assignmentId: string, studentId?: string) {
    const assignment = await assignmentRepository.findById(assignmentId, studentId);
    if (!assignment) {
      throw { statusCode: 404, message: 'Tugas kuliah tidak ditemukan.' };
    }
    return assignment;
  }

  async submitAssignment(params: {
    assignmentId: string;
    studentId: string;
    fileBuffer: Buffer;
    originalName: string;
    mimeType: string;
    ipAddress?: string;
  }) {
    const assignment = await assignmentRepository.findById(params.assignmentId);
    if (!assignment) {
      throw { statusCode: 404, message: 'Tugas tidak ditemukan.' };
    }

    // Check deadline
    const now = new Date();
    const isLate = now > new Date(assignment.deadline);
    const status = isLate ? 'TERLAMBAT' : 'DIKUMPULKAN';

    // Save file using StorageService abstraction
    const savedFile = storageService.saveBuffer(
      params.fileBuffer,
      params.originalName,
      params.mimeType
    );

    const submission = await assignmentRepository.upsertSubmission({
      assignment_id: params.assignmentId,
      student_id: params.studentId,
      file_url: savedFile.publicUrl,
      file_name: params.originalName,
      status,
    });

    await logAuditEvent({
      action: 'ASSIGNMENT_SUBMITTED',
      entity: 'ASSIGNMENT_SUBMISSION',
      entityId: submission.id,
      details: `Student submitted assignment ${assignment.title} (Status: ${status})`,
      ipAddress: params.ipAddress,
    });

    return submission;
  }

  async gradeSubmission(submissionId: string, score: number, feedback?: string, adminUserId?: string) {
    const graded = await assignmentRepository.gradeSubmission(submissionId, score, feedback);

    await logAuditEvent({
      userId: adminUserId,
      action: 'ASSIGNMENT_GRADED',
      entity: 'ASSIGNMENT_SUBMISSION',
      entityId: submissionId,
      details: `Submission graded: ${score}/100 for student ${graded.student.student_number}`,
    });

    return graded;
  }
}

export const assignmentService = new AssignmentService();
