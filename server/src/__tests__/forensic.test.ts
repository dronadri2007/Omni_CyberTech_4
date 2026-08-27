import { describe, expect, it } from 'vitest';
import { errorLevelAnalysis } from '../services/analysisEngine/forensic/ela';
import { readExif } from '../services/analysisEngine/forensic/exif';
import { verifyC2pa } from '../services/analysisEngine/forensic/c2pa';
import { imageStats } from '../services/analysisEngine/forensic/imageStats';
import { photoJpeg, flatSynthPng } from './fixtures';

describe('Error Level Analysis', () => {
  it('returns an 8x8 normalised heatmap and a bounded score', async () => {
    const { heatmapMatrix, elaScore, hotCell } = await errorLevelAnalysis(await photoJpeg());
    expect(heatmapMatrix).toHaveLength(8);
    expect(Math.max(...heatmapMatrix.flat())).toBeLessThanOrEqual(1);
    expect(Math.min(...heatmapMatrix.flat())).toBeGreaterThanOrEqual(0);
    expect(elaScore).toBeGreaterThanOrEqual(0);
    expect(elaScore).toBeLessThanOrEqual(100);
    expect(hotCell.row).toBeGreaterThanOrEqual(0);
  });
});

describe('image statistics', () => {
  it('flags an ultra-smooth large image as synthetic-looking', async () => {
    const { syntheticSmoothness, notes } = await imageStats(await flatSynthPng());
    expect(syntheticSmoothness).toBeGreaterThan(0);
    expect(notes.join(' ')).toMatch(/noise|generative|multiples of 64/i);
  });

  it('does not flag a noisy photo', async () => {
    const { syntheticSmoothness } = await imageStats(await photoJpeg());
    expect(syntheticSmoothness).toBeLessThan(40);
  });
});

describe('EXIF reader', () => {
  it('reports no camera provenance and a non-zero risk for a metadata-stripped image', async () => {
    const res = await readExif(await photoJpeg());
    expect(res.cameraMake).toBeUndefined();
    expect(res.cameraModel).toBeUndefined();
    expect(res.metadataRisk).toBeGreaterThan(0);
    expect(res.metadataRisk).toBeLessThanOrEqual(100);
  });

});

describe('C2PA probe', () => {
  it('reports NOT_VERIFIED when no manifest is present', async () => {
    const res = await verifyC2pa(await photoJpeg(), 'image/jpeg');
    expect(res.present).toBe(false);
    expect(res.verified).toBe(false);
    expect(['NOT_VERIFIED', 'UNAVAILABLE']).toContain(res.status);
  });
});
