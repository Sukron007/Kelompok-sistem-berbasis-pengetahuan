import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.ts';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
  'image/jpeg',
  'image/png',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.zip', '.rar', '.txt', '.png', '.jpg', '.jpeg'];

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Tipe file tidak diizinkan. Ekstensi yang diperbolehkan: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('MIME type file tidak valid untuk upload tugas.'));
    }
    cb(null, true);
  },
});

export const handleUploadError = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Ukuran file melebihi batas maksimal (10 MB).', 400);
    }
    return sendError(res, `Upload error: ${err.message}`, 400);
  } else if (err) {
    return sendError(res, err.message || 'Gagal memproses file upload.', 400);
  }
  next();
};
