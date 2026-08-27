import { Router } from 'express';
import {
  getCases,
  getCaseById,
  deleteCase,
  getProvenance,
  getEvidence,
  sendForReview,
  caseListQuery,
  caseIdParams,
  reviewNoteBody,
} from '../controllers/casesController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', validate({ query: caseListQuery }), getCases);
router.get('/:caseId', validate({ params: caseIdParams }), getCaseById);
router.get('/:caseId/provenance', validate({ params: caseIdParams }), getProvenance);
router.get('/:caseId/evidence', validate({ params: caseIdParams }), getEvidence);

router.post('/:caseId/review', requireAuth, validate({ params: caseIdParams, body: reviewNoteBody }), sendForReview);
router.delete('/:caseId', requireAuth, validate({ params: caseIdParams }), deleteCase);

export default router;
