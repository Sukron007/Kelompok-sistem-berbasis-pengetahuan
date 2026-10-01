import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.ts';
import { authenticateJwt, requireRole } from '../middleware/auth.ts';

const router = Router();

// Webhook endpoint MUST NOT have JWT auth header (Midtrans server calls this directly)
// Signature verification is performed inside paymentService
router.post('/midtrans/webhook', (req, res, next) => paymentController.handleWebhook(req, res, next));

// Sandbox simulation endpoint (Development/testing convenience)
router.post('/simulate-sandbox-status', (req, res, next) => paymentController.simulateSandboxWebhook(req, res, next));

// Protected payment endpoints
router.post('/', authenticateJwt, requireRole(['MAHASISWA']), (req, res, next) =>
  paymentController.createPayment(req, res, next)
);

router.get('/history', authenticateJwt, requireRole(['MAHASISWA']), (req, res, next) =>
  paymentController.getPaymentHistory(req, res, next)
);

router.get('/:id', authenticateJwt, (req, res, next) =>
  paymentController.getPaymentById(req, res, next)
);

export default router;
