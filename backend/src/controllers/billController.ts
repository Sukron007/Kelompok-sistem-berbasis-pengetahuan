import { Request, Response, NextFunction } from 'express';
import { billService } from '../services/billService.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class BillController {
  async getStudentBills(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const status = req.query.status as string;
      const bills = await billService.getStudentBills(studentId, status);
      return sendSuccess(res, bills);
    } catch (error) {
      next(error);
    }
  }

  async getBillById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const studentId = req.user?.role === 'MAHASISWA' ? req.user.studentId : undefined;
      const bill = await billService.getBillDetails(id, studentId);
      return sendSuccess(res, bill);
    } catch (error) {
      next(error);
    }
  }
}

export const billController = new BillController();
