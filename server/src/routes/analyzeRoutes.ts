import { Router } from 'express';
import multer from 'multer';
import { analyzeMedia, getAnalysisStatus } from '../controllers/analyzeController';

const upload = multer({
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit
  storage: multer.memoryStorage()
});

const router = Router();

router.post('/', upload.single('mediaFile'), analyzeMedia);
router.get('/:caseId/status', getAnalysisStatus);

export default router;
