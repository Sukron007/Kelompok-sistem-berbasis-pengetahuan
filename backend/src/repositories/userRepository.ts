import { prisma } from '../config/database.ts';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string): Promise<(User & { student: any | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        student: {
          include: {
            faculty: true,
            study_program: true,
            academic_year: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<(User & { student: any | null }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            faculty: true,
            study_program: true,
            academic_year: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();
