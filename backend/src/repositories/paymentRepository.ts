import { prisma } from '../config/database.ts';
import { Prisma } from '@prisma/client';

export class PaymentRepository {
  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        bill: {
          include: {
            academic_year: true,
          },
        },
        student: {
          include: {
            study_program: true,
            faculty: true,
            user: { select: { email: true } },
          },
        },
        receipt: true,
        logs: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  async findByOrderId(orderId: string) {
    return prisma.payment.findUnique({
      where: { order_id: orderId },
      include: {
        bill: {
          include: {
            academic_year: true,
          },
        },
        student: {
          include: {
            study_program: true,
            faculty: true,
            user: { select: { email: true } },
          },
        },
        receipt: true,
      },
    });
  }

  async findByTransactionId(transactionId: string) {
    return prisma.payment.findUnique({
      where: { transaction_id: transactionId },
      include: {
        bill: true,
        student: true,
        receipt: true,
      },
    });
  }

  async findPendingByBillId(billId: string) {
    return prisma.payment.findFirst({
      where: {
        bill_id: billId,
        transaction_status: 'pending',
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findSuccessfulByBillId(billId: string) {
    return prisma.payment.findFirst({
      where: {
        bill_id: billId,
        transaction_status: {
          in: ['settlement', 'capture'],
        },
      },
    });
  }

  async findByStudentId(studentId: string) {
    return prisma.payment.findMany({
      where: { student_id: studentId },
      include: {
        bill: {
          include: {
            academic_year: true,
          },
        },
        receipt: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    studentId?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    if (params.status) {
      where.transaction_status = params.status;
    }

    if (params.studentId) {
      where.student_id = params.studentId;
    }

    if (params.search) {
      where.OR = [
        { order_id: { contains: params.search } },
        { transaction_id: { contains: params.search } },
        { student: { full_name: { contains: params.search } } },
        { student: { student_number: { contains: params.search } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              student_number: true,
              full_name: true,
              study_program: { select: { name: true } },
            },
          },
          bill: {
            select: {
              semester: true,
              bill_type: true,
              academic_year: { select: { name: true } },
            },
          },
          receipt: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: {
    bill_id: string;
    student_id: string;
    order_id: string;
    gross_amount: number;
    snap_token?: string | null;
    snap_redirect_url?: string | null;
  }) {
    return prisma.payment.create({
      data: {
        bill_id: data.bill_id,
        student_id: data.student_id,
        order_id: data.order_id,
        gross_amount: data.gross_amount,
        transaction_status: 'pending',
        snap_token: data.snap_token,
        snap_redirect_url: data.snap_redirect_url,
      },
    });
  }

  async createPaymentLog(data: {
    payment_id: string;
    event_type: string;
    transaction_status: string;
    payload: string;
  }) {
    return prisma.paymentLog.create({
      data,
    });
  }

  /**
   * Atomic ACID settlement transaction:
   * 1. Updates payment status, payment_type, transaction_id, settlement_time
   * 2. Updates bill status to PAID
   * 3. Creates Receipt (idempotent check)
   * 4. Logs payment log
   * 5. Creates notification for student
   */
  async processSettlementTransaction(params: {
    paymentId: string;
    billId: string;
    studentId: string;
    transactionId: string;
    paymentType: string;
    settlementTime: Date;
    receiptNumber: string;
    notificationTitle: string;
    notificationMessage: string;
    rawPayload: string;
    fraudStatus?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Payment
      const updatedPayment = await tx.payment.update({
        where: { id: params.paymentId },
        data: {
          transaction_status: 'settlement',
          transaction_id: params.transactionId,
          payment_type: params.paymentType,
          settlement_time: params.settlementTime,
          fraud_status: params.fraudStatus || 'accept',
        },
      });

      // 2. Update Bill to PAID
      await tx.bill.update({
        where: { id: params.billId },
        data: {
          status: 'PAID',
        },
      });

      // 3. Create Receipt (if not already existing)
      const existingReceipt = await tx.receipt.findUnique({
        where: { payment_id: params.paymentId },
      });

      let receipt = existingReceipt;
      if (!existingReceipt) {
        receipt = await tx.receipt.create({
          data: {
            payment_id: params.paymentId,
            receipt_number: params.receiptNumber,
            issued_at: params.settlementTime,
          },
        });
      }

      // 4. Create Payment Log
      await tx.paymentLog.create({
        data: {
          payment_id: params.paymentId,
          event_type: 'SETTLEMENT_SUCCESS',
          transaction_status: 'settlement',
          payload: params.rawPayload,
        },
      });

      // 5. Create Notification for Student
      await tx.notification.create({
        data: {
          title: params.notificationTitle,
          message: params.notificationMessage,
          type: 'PAYMENT_SUCCESS',
          target_student_id: params.studentId,
        },
      });

      return { payment: updatedPayment, receipt };
    });
  }

  /**
   * Atomic update for non-settlement statuses (deny, expire, cancel, failure, pending)
   */
  async updateStatusWithLog(params: {
    paymentId: string;
    billId: string;
    transactionStatus: string;
    transactionId?: string;
    paymentType?: string;
    rawPayload: string;
    newBillStatus?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: params.paymentId },
        data: {
          transaction_status: params.transactionStatus,
          ...(params.transactionId ? { transaction_id: params.transactionId } : {}),
          ...(params.paymentType ? { payment_type: params.paymentType } : {}),
        },
      });

      if (params.newBillStatus) {
        await tx.bill.update({
          where: { id: params.billId },
          data: { status: params.newBillStatus },
        });
      }

      await tx.paymentLog.create({
        data: {
          payment_id: params.paymentId,
          event_type: `STATUS_${params.transactionStatus.toUpperCase()}`,
          transaction_status: params.transactionStatus,
          payload: params.rawPayload,
        },
      });

      return updatedPayment;
    });
  }
}

export const paymentRepository = new PaymentRepository();
