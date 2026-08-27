import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { analyzer } from '../services/analysisEngine';
import { store } from '../services/store';
import { MediaCategory } from '../types';

export const analyzeBodySchema = z.object({
  url: z.string().url().optional(),
  category: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'URL']).optional(),
});

export const caseIdParam = z.object({
  caseId: z.string().regex(/^VF-\d{4}-\d{4,8}$/, 'Invalid case id'),
});

function inferCategory(opts: { explicit?: string; mime?: string; url?: string }): MediaCategory {
  if (opts.explicit) return opts.explicit as MediaCategory;
  const mime = opts.mime ?? '';
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime.startsWith('audio/')) return 'AUDIO';
  if (opts.url) {
    if (/\.(mp4|mov|avi|webm|mkv)$/i.test(opts.url)) return 'VIDEO';
    if (/\.(mp3|wav|m4a|ogg|flac)$/i.test(opts.url)) return 'AUDIO';
  }
  return 'IMAGE';
}

export const analyzeMedia = asyncHandler(async (req, res) => {
  const file = req.file;
  const { url, category } = req.body as z.infer<typeof analyzeBodySchema>;

  if (!file && !url) throw AppError.badRequest('Provide either a file upload (field "mediaFile") or a media URL.');

  const filename = file
    ? file.originalname
    : url
      ? url.substring(url.lastIndexOf('/') + 1) || 'web_media_sample'
      : 'unknown_file';
  const mimeType = file ? file.mimetype : 'application/octet-stream';

  const newCase = await analyzer.analyze({
    filename,
    mimeType,
    sizeBytes: file ? file.size : 0,
    buffer: file ? file.buffer : undefined,
    url,
    mediaCategory: inferCategory({ explicit: category, mime: mimeType, url }),
    userId: req.auth?.sub,
  });

  await store.addCase(newCase);

  res.status(200).json({ message: 'Analysis completed', caseId: newCase.id, result: newCase });
});

export const getAnalysisStatus = asyncHandler(async (req, res) => {
  const analysisCase = await store.getCaseById(req.params.caseId);
  if (!analysisCase) throw AppError.notFound('Case not found');
  res.status(200).json({
    caseId: analysisCase.id,
    status: analysisCase.status,
    verdict: analysisCase.verdict,
    confidence: analysisCase.confidence,
  });
});
