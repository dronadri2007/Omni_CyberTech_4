import { Router } from 'express';
import { getStats, getApiKeys, createApiKey } from '../controllers/statsController';

const router = Router();

router.get('/stats', getStats);
router.get('/keys', getApiKeys);
router.post('/keys', createApiKey);

export default router;
