import { Request, Response } from 'express';
import { MockMediaAnalyzer } from '../services/analysisEngine/MockMediaAnalyzer';
import { MockStore } from '../services/MockStore';
import { MediaCategory } from '../types';

const analyzer = new MockMediaAnalyzer();

export const analyzeMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { url, category } = req.body;

    if (!file && !url) {
      return res.status(400).json({ error: 'Either a file upload or a media URL must be provided.' });
    }

    let filename = file ? file.originalname : (url ? url.substring(url.lastIndexOf('/') + 1) || 'web_media_sample' : 'unknown_file');
    let mimeType = file ? file.mimetype : 'image/jpeg';
    let sizeBytes = file ? file.size : 1024000;

    let mediaCategory: MediaCategory = 'IMAGE';
    if (category) {
      mediaCategory = category as MediaCategory;
    } else if (file) {
      if (file.mimetype.startsWith('video/')) mediaCategory = 'VIDEO';
      else if (file.mimetype.startsWith('audio/')) mediaCategory = 'AUDIO';
    } else if (url) {
      if (url.match(/\.(mp4|mov|avi)$/i)) mediaCategory = 'VIDEO';
      else if (url.match(/\.(mp3|wav|m4a|ogg)$/i)) mediaCategory = 'AUDIO';
    }

    const newCase = await analyzer.analyze({
      filename,
      mimeType,
      sizeBytes,
      buffer: file ? file.buffer : undefined,
      url,
      mediaCategory
    });

    MockStore.addCase(newCase);

    return res.status(200).json({
      message: 'Analysis completed successfully',
      caseId: newCase.id,
      result: newCase
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to complete media analysis', details: err.message });
  }
};

export const getAnalysisStatus = (req: Request, res: Response) => {
  const { caseId } = req.params;
  const analysisCase = MockStore.getCaseById(caseId);

  if (!analysisCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  return res.status(200).json({
    caseId: analysisCase.id,
    status: analysisCase.status,
    verdict: analysisCase.verdict,
    confidence: analysisCase.confidence
  });
};
