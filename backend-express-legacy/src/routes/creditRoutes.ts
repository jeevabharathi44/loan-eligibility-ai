import { Router } from 'express';
import { verifyCredit, getCreditProfile, verifyCreditSchema } from '../controllers/creditController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.use(authenticateJWT);

router.post('/verify', validateRequest(verifyCreditSchema), verifyCredit);
router.get('/:applicationId', getCreditProfile);

export default router;
