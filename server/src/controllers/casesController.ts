import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { store } from '../services/store';

export const caseListQuery = z.object({
  verdict: z.string().optional(),
  risk: z.string().optional(),
  search: z.string().max(200).optional(),
  mediaType: z.string().optional(),
});

export const caseIdParams = z.object({
  caseId: z.string().min(3).max(64),
});

export const reviewNoteBody = z.object({
  notes: z.string().max(2000).optional(),
});

export const getCases = asyncHandler(async (req, res) => {
  const cases = await store.getAllCases(req.query as z.infer<typeof caseListQuery>);
  res.status(200).json({ count: cases.length, cases });
});

export const getCaseById = asyncHandler(async (req, res) => {
  const item = await store.getCaseById(req.params.caseId);
  if (!item) throw AppError.notFound('Case not found');
  res.status(200).json(item);
});

export const deleteCase = asyncHandler(async (req, res) => {
  const ok = await store.deleteCase(req.params.caseId);
  if (!ok) throw AppError.notFound('Case not found or already deleted');
  res.status(200).json({ message: 'Case deleted', caseId: req.params.caseId });
});

export const getProvenance = asyncHandler(async (req, res) => {
  const item = await store.getCaseById(req.params.caseId);
  if (!item) throw AppError.notFound('Case not found');
  res.status(200).json({ caseId: item.id, provenance: item.provenanceDetails });
});

export const getEvidence = asyncHandler(async (req, res) => {
  const item = await store.getCaseById(req.params.caseId);
  if (!item) throw AppError.notFound('Case not found');
  res.status(200).json({ caseId: item.id, mediaFile: item.mediaFile, detectionResults: item.detectionResults });
});

export const sendForReview = asyncHandler(async (req, res) => {
  const item = await store.getCaseById(req.params.caseId);
  if (!item) throw AppError.notFound('Case not found');
  await store.updateCase(item.id, { status: 'IN_REVIEW', reviewRequired: true });
  await store.updateReview(item.id, { notes: req.body.notes, status: 'IN_REVIEW' });
  res.status(200).json({ message: 'Case submitted to the human review queue', caseId: item.id, status: 'IN_REVIEW' });
});
