import { env } from '../../config/env';
import type { MediaAnalyzer } from './MediaAnalyzer';
import { ForensicMediaAnalyzer } from './ForensicMediaAnalyzer';
import { MockMediaAnalyzer } from './MockMediaAnalyzer';
import { PyTorchMediaAnalyzer } from './PyTorchMediaAnalyzer';

export type { MediaAnalyzer, AnalysisInput } from './MediaAnalyzer';
export { ForensicMediaAnalyzer, MockMediaAnalyzer, PyTorchMediaAnalyzer };

function build(): MediaAnalyzer {
  switch (env.ANALYZER) {
    case 'mock':
      return new MockMediaAnalyzer();
    case 'pytorch':
      return new PyTorchMediaAnalyzer();
    case 'forensic':
    default:
      return new ForensicMediaAnalyzer();
  }
}

/** The analyzer selected by the `ANALYZER` env var. */
export const analyzer: MediaAnalyzer = build();
export const activeAnalyzerName: string = env.ANALYZER;
