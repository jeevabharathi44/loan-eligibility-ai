import { Router } from 'express';
import {
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplicationStatus,
  createApplicationSchema,
  updateStatusSchema,
} from '../controllers/applicationController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateRequest(createApplicationSchema), createApplication);
router.get('/', getUserApplications);
router.get('/:id', getApplicationById);
router.put('/:id', requireAdmin, validateRequest(updateStatusSchema), updateApplicationStatus);

export default router;
