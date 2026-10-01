import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/apiResponse.ts';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // Never expose raw stack traces in responses
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validasi input gagal.', 422, formattedErrors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return sendError(res, `Data duplikat: Nilai pada ${target} sudah digunakan.`, 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Data yang diminta tidak ditemukan.', 404);
    }
    return sendError(res, 'Kesalahan transaksi database.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Terjadi kesalahan internal pada server.';

  return sendError(res, message, statusCode);
};
