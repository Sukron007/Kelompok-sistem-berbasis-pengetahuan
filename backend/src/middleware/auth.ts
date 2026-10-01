import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.ts';
import { prisma } from '../config/database.ts';
import { sendError } from '../utils/apiResponse.ts';

export interface AuthUser {
  id: string;
  email: string;
  role: 'MAHASISWA' | 'ADMIN';
  studentId?: string;
  studentNumber?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateJwt = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      userId: string;
      email: string;
      role: 'MAHASISWA' | 'ADMIN';
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true },
    });

    if (!user || !user.is_active) {
      return sendError(res, 'Pengguna tidak ditemukan atau akun telah dinonaktifkan.', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'MAHASISWA' | 'ADMIN',
      studentId: user.student?.id,
      studentNumber: user.student?.student_number,
    };

    next();
  } catch (error) {
    return sendError(res, 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.', 401);
  }
};

export const requireRole = (roles: Array<'MAHASISWA' | 'ADMIN'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Autentikasi diperlukan.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Anda tidak memiliki hak akses untuk tindakan ini.', 403);
    }

    next();
  };
};

export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 'Autentikasi diperlukan.', 401);
  }

  if (req.user.role !== 'MAHASISWA' || !req.user.studentId) {
    return sendError(res, 'Akses terbatas untuk data mahasiswa.', 403);
  }

  next();
};
