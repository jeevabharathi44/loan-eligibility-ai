import { Router } from 'express';
import { register, login, getMe, registerSchema, loginSchema } from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.get('/me', authenticateJWT, getMe);

export default router;
