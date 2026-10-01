import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.ts';
import { loginSchema } from '../validators/index.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress;
      const result = await authService.login(validated.email, validated.password, ip);
      return sendSuccess(res, result, 200, 'Login berhasil');
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, { loggedOut: true }, 200, 'Logout berhasil');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
