import { Router } from 'express';
import multer from 'multer';
import { analyzeMedia, getAnalysisStatus, analyzeBodySchema } from '../controllers/analyzeController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { env } from '../config/env';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/^(image|video|audio)\//.test(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported media type: ${file.mimetype}`));
  },
});

const router = Router();

router.post('/', requireAuth, upload.single('mediaFile'), validate({ body: analyzeBodySchema }), analyzeMedia);
router.get('/:caseId/status', getAnalysisStatus);

export default router;
