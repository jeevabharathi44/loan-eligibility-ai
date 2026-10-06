import { Router } from 'express';
import { getAllApplications, getAdminStatistics } from '../controllers/adminController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireAdmin);

router.get('/applications', getAllApplications);
router.get('/statistics', getAdminStatistics);

export default router;
