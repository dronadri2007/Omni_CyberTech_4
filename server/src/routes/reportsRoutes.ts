import { Router } from 'express';
import { getReportByCaseId } from '../controllers/reportsController';
import { validate } from '../middleware/validate';
import { caseIdParams } from '../controllers/casesController';

const router = Router();

router.get('/:caseId', validate({ params: caseIdParams }), getReportByCaseId);

export default router;
