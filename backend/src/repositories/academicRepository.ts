import { prisma } from '../config/database.ts';

export class AcademicRepository {
  async getFaculties() {
    return prisma.faculty.findMany({
      include: { study_programs: true },
      orderBy: { code: 'asc' },
    });
  }

  async createFaculty(data: { code: string; name: string }) {
    return prisma.faculty.create({ data });
  }

  async getStudyPrograms(facultyId?: string) {
    return prisma.studyProgram.findMany({
      where: facultyId ? { faculty_id: facultyId } : undefined,
      include: { faculty: true },
      orderBy: { code: 'asc' },
    });
  }

  async createStudyProgram(data: { faculty_id: string; code: string; name: string }) {
    return prisma.studyProgram.create({ data });
  }

  async getAcademicYears() {
    return prisma.academicYear.findMany({
      orderBy: { start_date: 'desc' },
    });
  }

  async getActiveAcademicYear() {
    return prisma.academicYear.findFirst({
      where: { is_active: true },
    });
  }
}

export const academicRepository = new AcademicRepository();
