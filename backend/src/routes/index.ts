import { Router } from 'express';
import authRoutes from './authRoutes';
import applicationRoutes from './applicationRoutes';
import creditRoutes from './creditRoutes';
import predictionRoutes from './predictionRoutes';
import dashboardRoutes from './dashboardRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/credit', creditRoutes);
router.use('/predictions', predictionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

export default router;
