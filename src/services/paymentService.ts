import { api } from './api.ts';
import { ApiResponse, Payment } from '../types/index.ts';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export interface PaymentCreationResult {
  payment_id: string;
  order_id: string;
  snap_token: string;
  redirect_url: string;
  amount: number;
  client_key: string;
  is_sandbox: boolean;
  is_mock_token?: boolean;
  selected_method?: string;
  payment_instructions?: {
    bank: string;
    channel: string;
    va_number?: string;
    biller_code?: string;
    bill_key?: string;
    steps: string[];
  } | null;
}

export const paymentService = {
  async createPayment(billId: string, paymentMethod?: string) {
    const res = await api.post<ApiResponse<PaymentCreationResult>>('/payments', {
      bill_id: billId,
      payment_method: paymentMethod,
    });
    return res.data.data;
  },

  async getHistory() {
    const res = await api.get<ApiResponse<Payment[]>>('/payments/history');
    return res.data.data;
  },

  async getPaymentById(id: string) {
    const res = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return res.data.data;
  },

  /**
   * Trigger Midtrans Snap Popup UI
   */
  openSnapPopup(
    snapToken: string,
    callbacks: {
      onSuccess?: (result: any) => void;
      onPending?: (result: any) => void;
      onError?: (result: any) => void;
      onClose?: () => void;
    }
  ) {
    if (window.snap && typeof window.snap.pay === 'function') {
      window.snap.pay(snapToken, callbacks);
    } else {
      console.warn('Midtrans Snap JS not loaded, opening redirect url');
      callbacks.onClose?.();
    }
  },

  /**
   * Sandbox simulation for local development / testing
   */
  async simulateSandboxStatus(orderId: string, status: 'settlement' | 'expire' | 'cancel') {
    const res = await api.post<ApiResponse<any>>('/payments/simulate-sandbox-status', {
      order_id: orderId,
      transaction_status: status,
    });
    return res.data.data;
  },
};
