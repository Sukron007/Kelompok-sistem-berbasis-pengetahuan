import { Response } from 'express';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  data?: T;
  message?: string;
  errors?: any[];
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string) => {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors: any[] = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
