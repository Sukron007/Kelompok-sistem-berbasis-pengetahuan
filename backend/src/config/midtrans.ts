import midtransClient from 'midtrans-client';
import { ENV } from './env.ts';

// Check if Midtrans keys are configured
export const isMidtransConfigured = Boolean(
  ENV.MIDTRANS_SERVER_KEY &&
  ENV.MIDTRANS_SERVER_KEY.trim() !== '' &&
  !ENV.MIDTRANS_SERVER_KEY.includes('YOUR_SANDBOX_SERVER_KEY')
);

// Midtrans Snap client for creating transactions
export const snapClient = new midtransClient.Snap({
  isProduction: ENV.MIDTRANS_IS_PRODUCTION,
  serverKey: ENV.MIDTRANS_SERVER_KEY,
  clientKey: ENV.MIDTRANS_CLIENT_KEY,
});

// Midtrans CoreApi for checking status or handling direct API actions
export const coreApiClient = new midtransClient.CoreApi({
  isProduction: ENV.MIDTRANS_IS_PRODUCTION,
  serverKey: ENV.MIDTRANS_SERVER_KEY,
  clientKey: ENV.MIDTRANS_CLIENT_KEY,
});
