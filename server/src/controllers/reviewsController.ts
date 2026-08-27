import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { store } from '../services/store';

export const reviewUpdateBody = z.object({
  status: z.enum(['PENDING', 'IN_REVIEW', 'VERIFIED', 'OVERRIDDEN', 'REJECTED', 'ESCALATED']).optional(),
  reviewerVerdict: z.enum(['AUTHENTIC', 'SUSPICIOUS', 'MANIPULATED', 'INCONCLUSIVE']).optional(),
  notes: z.string().max(2000).optional(),
  reviewerName: z.string().max(120).optional(),
});

export const reviewIdParams = z.object({ id: z.string().min(3).max(64) });

export const getReviews = asyncHandler(async (_req, res) => {
  const reviews = await store.getAllReviews();
  res.status(200).json({ count: reviews.length, reviews });
});

export const updateReview = asyncHandler(async (req, res) => {
  const updated = await store.updateReview(req.params.id, {
    ...req.body,
    reviewerId: req.auth?.sub,
    reviewerName: req.body.reviewerName ?? req.auth?.name,
  });
  if (!updated) throw AppError.notFound('Review case not found');
  res.status(200).json({ message: 'Review updated', review: updated });
});
