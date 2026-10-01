import { Router } from 'express';
import { billController } from '../controllers/billController.ts';
import { authenticateJwt } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateJwt);

router.get('/', (req, res, next) => billController.getStudentBills(req, res, next));
router.get('/:id', (req, res, next) => billController.getBillById(req, res, next));

export default router;
