import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/paymentService.ts';
import { createPaymentSchema } from '../validators/index.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class PaymentController {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const validated = createPaymentSchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress;

      const result = await paymentService.createPayment(
        studentId,
        validated.bill_id,
        validated.payment_method,
        ip
      );
      return sendSuccess(res, result, 201, 'Token pembayaran Midtrans berhasil dibuat');
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.studentId!;
      const history = await paymentService.getPaymentHistory(studentId);
      return sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const studentId = req.user?.role === 'MAHASISWA' ? req.user.studentId : undefined;
      const payment = await paymentService.getPaymentDetails(id, studentId);
      return sendSuccess(res, payment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Midtrans Webhook (Called by Midtrans notification service)
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const ip = req.ip || req.socket.remoteAddress;
      const result = await paymentService.processMidtransWebhook(payload, ip);
      return res.status(200).json({
        status: 'OK',
        message: 'Notification processed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sandbox simulation endpoint for testing webhook processing in development
   */
  async simulateSandboxWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { order_id, transaction_status, payment_type } = req.body;
      const payment = await paymentService.getPaymentDetails(order_id);
      
      const simulatedPayload = {
        order_id: payment.order_id,
        status_code: '200',
        gross_amount: payment.gross_amount.toString(),
        transaction_status: transaction_status || 'settlement',
        fraud_status: 'accept',
        payment_type: payment_type || 'qris',
        transaction_id: `SIM-TRX-${Date.now()}`,
        settlement_time: new Date().toISOString(),
      };

      const result = await paymentService.processMidtransWebhook(simulatedPayload, req.ip);
      return sendSuccess(res, result, 200, 'Simulasi webhook Midtrans berhasil diproses');
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
