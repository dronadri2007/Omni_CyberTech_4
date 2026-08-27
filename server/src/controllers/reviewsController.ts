import { Request, Response } from 'express';
import { MockStore } from '../services/MockStore';

export const getReviews = (req: Request, res: Response) => {
  const reviews = MockStore.getAllReviews();
  return res.status(200).json({
    count: reviews.length,
    reviews
  });
};

export const updateReview = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewerVerdict, notes, reviewerName } = req.body;

  const updated = MockStore.updateReview(id, {
    status,
    reviewerVerdict,
    notes,
    reviewerName
  });

  if (!updated) {
    return res.status(404).json({ error: 'Review case not found' });
  }

  return res.status(200).json({
    message: 'Review updated successfully',
    review: updated
  });
};
