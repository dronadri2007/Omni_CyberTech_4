import { Router } from 'express';
import { getReviews, updateReview } from '../controllers/reviewsController';

const router = Router();

router.get('/', getReviews);
router.patch('/:id', updateReview);

export default router;
