import { Router } from 'express';
import { getStats, getApiKeys, createApiKey, apiKeyBody } from '../controllers/statsController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/stats', getStats);
router.get('/keys', requireAuth, getApiKeys);
router.post('/keys', requireAuth, validate({ body: apiKeyBody }), createApiKey);

export default router;
