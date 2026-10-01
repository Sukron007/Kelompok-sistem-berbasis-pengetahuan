import { api } from './api.ts';
import { ApiResponse, Assignment, AssignmentSubmission } from '../types/index.ts';

export const assignmentService = {
  async getAssignments(courseId?: string) {
    const res = await api.get<ApiResponse<Assignment[]>>('/assignments', {
      params: courseId ? { course_id: courseId } : undefined,
    });
    return res.data.data;
  },

  async getAssignmentById(id: string) {
    const res = await api.get<ApiResponse<Assignment>>(`/assignments/${id}`);
    return res.data.data;
  },

  async submitAssignment(assignmentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<AssignmentSubmission>>(
      `/assignments/${assignmentId}/submission`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  },

  async gradeSubmission(submissionId: string, data: { score: number; feedback?: string }) {
    const res = await api.patch<ApiResponse<AssignmentSubmission>>(
      `/assignments/submissions/${submissionId}/grade`,
      data
    );
    return res.data.data;
  },
};
