import { academicRepository } from '../repositories/academicRepository.ts';
import { courseRepository } from '../repositories/courseRepository.ts';
import { scheduleRepository } from '../repositories/scheduleRepository.ts';
import { studentRepository } from '../repositories/studentRepository.ts';

export class AcademicService {
  async getStudentAcademicOverview(studentId: string) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw { statusCode: 404, message: 'Data mahasiswa tidak ditemukan.' };
    }

    const courses = await courseRepository.findAll({ isActive: true });
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    return {
      student: {
        student_number: student.student_number,
        full_name: student.full_name,
        faculty: student.faculty.name,
        faculty_code: student.faculty.code,
        study_program: student.study_program.name,
        study_program_code: student.study_program.code,
        semester: student.semester,
        academic_year: student.academic_year.name,
      },
      summary: {
        totalCourses: courses.length,
        totalCredits,
        gpaEstimated: 3.82, // Standard SI Cumulative representation
      },
      courses,
    };
  }

  async getAllCourses(search?: string) {
    return courseRepository.findAll({ search, isActive: true });
  }

  async getAllSchedules(dayOfWeek?: string) {
    return scheduleRepository.findAll({ dayOfWeek });
  }

  async getFaculties() {
    return academicRepository.getFaculties();
  }

  async getStudyPrograms(facultyId?: string) {
    return academicRepository.getStudyPrograms(facultyId);
  }

  async getAcademicYears() {
    return academicRepository.getAcademicYears();
  }
}

export const academicService = new AcademicService();
