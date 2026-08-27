import { Router } from 'express';
import { getReviews, updateReview, reviewUpdateBody, reviewIdParams } from '../controllers/reviewsController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getReviews);
router.patch('/:id', requireAuth, validate({ params: reviewIdParams, body: reviewUpdateBody }), updateReview);

export default router;
