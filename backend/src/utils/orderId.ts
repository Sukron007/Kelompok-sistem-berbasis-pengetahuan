import crypto from 'crypto';

export const generateOrderId = (billId: string, studentNumber: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SPP-${studentNumber}-${timestamp}-${randomHex}`;
};

export const generateReceiptNumber = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RCP-${dateStr}-${randomHex}`;
};
