import { Router } from 'express';
import { runPrediction, getPredictionByApplicationId, createPredictionSchema } from '../controllers/predictionController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateRequest(createPredictionSchema), runPrediction);
router.get('/:applicationId', getPredictionByApplicationId);

export default router;
