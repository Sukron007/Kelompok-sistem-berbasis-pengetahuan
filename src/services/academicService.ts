import { api } from './api.ts';
import { ApiResponse, Course, CourseSchedule } from '../types/index.ts';

export interface AcademicOverview {
  student: {
    student_number: string;
    full_name: string;
    faculty: string;
    faculty_code: string;
    study_program: string;
    study_program_code: string;
    semester: number;
    academic_year: string;
  };
  summary: {
    totalCourses: number;
    totalCredits: number;
    gpaEstimated: number;
  };
  courses: Course[];
}

export const academicService = {
  async getOverview() {
    const res = await api.get<ApiResponse<AcademicOverview>>('/academic/overview');
    return res.data.data;
  },

  async getCourses(search?: string) {
    const res = await api.get<ApiResponse<Course[]>>('/academic/courses', {
      params: search ? { search } : undefined,
    });
    return res.data.data;
  },

  async getSchedules(day?: string) {
    const res = await api.get<ApiResponse<CourseSchedule[]>>('/academic/schedules', {
      params: day ? { day } : undefined,
    });
    return res.data.data;
  },

  async getFaculties() {
    const res = await api.get<ApiResponse<any[]>>('/academic/faculties');
    return res.data.data;
  },

  async getStudyPrograms(facultyId?: string) {
    const res = await api.get<ApiResponse<any[]>>('/academic/study-programs', {
      params: facultyId ? { faculty_id: facultyId } : undefined,
    });
    return res.data.data;
  },

  async getAcademicYears() {
    const res = await api.get<ApiResponse<any[]>>('/academic/academic-years');
    return res.data.data;
  },
};
