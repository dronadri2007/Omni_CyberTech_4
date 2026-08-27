import { Request, Response } from 'express';
import { MockStore } from '../services/MockStore';

export const getCases = (req: Request, res: Response) => {
  let cases = MockStore.getAllCases();
  const { verdict, risk, search, mediaType } = req.query;

  if (verdict) {
    cases = cases.filter(c => c.verdict.toLowerCase() === (verdict as string).toLowerCase());
  }

  if (risk) {
    cases = cases.filter(c => c.riskLevel.toLowerCase() === (risk as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    cases = cases.filter(c => c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  }

  if (mediaType) {
    const typeStr = (mediaType as string).toUpperCase();
    cases = cases.filter(c => {
      if (typeStr === 'IMAGE') return c.mediaFile.mimeType.includes('image');
      if (typeStr === 'VIDEO') return c.mediaFile.mimeType.includes('video');
      if (typeStr === 'AUDIO') return c.mediaFile.mimeType.includes('audio');
      return true;
    });
  }

  return res.status(200).json({
    count: cases.length,
    cases
  });
};

export const getCaseById = (req: Request, res: Response) => {
  const { caseId } = req.params;
  const item = MockStore.getCaseById(caseId);

  if (!item) {
    return res.status(404).json({ error: 'Case not found' });
  }

  return res.status(200).json(item);
};

export const deleteCase = (req: Request, res: Response) => {
  const { caseId } = req.params;
  const deleted = MockStore.deleteCase(caseId);

  if (!deleted) {
    return res.status(404).json({ error: 'Case not found or already deleted' });
  }

  return res.status(200).json({ message: 'Case deleted successfully', caseId });
};

export const getProvenance = (req: Request, res: Response) => {
  const { caseId } = req.params;
  const item = MockStore.getCaseById(caseId);

  if (!item) {
    return res.status(404).json({ error: 'Case not found' });
  }

  return res.status(200).json({
    caseId: item.id,
    provenance: item.provenanceDetails
  });
};

export const getEvidence = (req: Request, res: Response) => {
  const { caseId } = req.params;
  const item = MockStore.getCaseById(caseId);

  if (!item) {
    return res.status(404).json({ error: 'Case not found' });
  }

  return res.status(200).json({
    caseId: item.id,
    mediaFile: item.mediaFile,
    detectionResults: item.detectionResults
  });
};

export const sendForReview = (req: Request, res: Response) => {
  const { caseId } = req.params;
  const { notes } = req.body;

  const item = MockStore.getCaseById(caseId);
  if (!item) {
    return res.status(404).json({ error: 'Case not found' });
  }

  item.status = 'IN_REVIEW';
  item.reviewRequired = true;

  const updatedReviews = MockStore.updateReview(caseId, {
    notes,
    status: 'IN_REVIEW'
  });

  return res.status(200).json({
    message: 'Case successfully submitted to Human Review Queue',
    caseId,
    status: item.status
  });
};
