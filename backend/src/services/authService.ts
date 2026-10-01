import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.ts';
import { ENV } from '../config/env.ts';
import { logAuditEvent } from '../middleware/audit.ts';

export class AuthService {
  async login(email: string, passwordPlain: string, ipAddress?: string) {
    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw { statusCode: 401, message: 'Email atau password salah.' };
    }

    if (!user.is_active) {
      throw { statusCode: 403, message: 'Akun Anda telah dinonaktifkan. Hubungi admin akademik.' };
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Email atau password salah.' };
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    await logAuditEvent({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'USER',
      entityId: user.id,
      details: `User ${user.email} logged in successfully`,
      ipAddress,
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      student: user.student
        ? {
            id: user.student.id,
            student_number: user.student.student_number,
            full_name: user.student.full_name,
            phone: user.student.phone,
            photo_url: user.student.photo_url,
            address: user.student.address,
            semester: user.student.semester,
            faculty: user.student.faculty?.name,
            study_program: user.student.study_program?.name,
            academic_year: user.student.academic_year?.name,
          }
        : null,
    };

    return {
      token,
      user: sanitizedUser,
    };
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'Pengguna tidak ditemukan.' };
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      student: user.student
        ? {
            id: user.student.id,
            student_number: user.student.student_number,
            full_name: user.student.full_name,
            phone: user.student.phone,
            photo_url: user.student.photo_url,
            address: user.student.address,
            semester: user.student.semester,
            faculty: user.student.faculty?.name,
            study_program: user.student.study_program?.name,
            academic_year: user.student.academic_year?.name,
          }
        : null,
    };
  }
}

export const authService = new AuthService();
