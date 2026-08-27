import { Router } from 'express';
import { getReportByCaseId } from '../controllers/reportsController';

const router = Router();

router.get('/:caseId', getReportByCaseId);

export default router;
