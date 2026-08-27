import { AnalysisCase, MediaCategory } from '../../types';

export interface AnalysisInput {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  buffer?: Buffer;
  url?: string;
  mediaCategory: MediaCategory;
  userId?: string;
}

export interface MediaAnalyzer {
  analyze(input: AnalysisInput): Promise<AnalysisCase>;
}
