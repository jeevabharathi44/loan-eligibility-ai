import { Router } from 'express';
import { getDashboardStatistics } from '../controllers/dashboardController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.get('/statistics', getDashboardStatistics);

export default router;
