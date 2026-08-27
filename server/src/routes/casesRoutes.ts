import { Router } from 'express';
import {
  getCases,
  getCaseById,
  deleteCase,
  getProvenance,
  getEvidence,
  sendForReview
} from '../controllers/casesController';

const router = Router();

router.get('/', getCases);
router.get('/:caseId', getCaseById);
router.delete('/:caseId', deleteCase);
router.get('/:caseId/provenance', getProvenance);
router.get('/:caseId/evidence', getEvidence);
router.post('/:caseId/review', sendForReview);

export default router;
