import sharp from 'sharp';

export interface ElaResult {
  /** Row-major grid of normalised 0..1 residual energy, ready for the heatmap overlay. */
  heatmapMatrix: number[][];
  /** 0..100 — higher means stronger localised recompression residue (edit-like). */
  elaScore: number;
  /** Grid coordinates of the hottest cell. */
  hotCell: { row: number; col: number; value: number };
  gridRows: number;
  gridCols: number;
}

const GRID = 8;
const ANALYSIS_QUALITY = 90;

/**
 * Error Level Analysis: re-encode the image at a known JPEG quality, diff against the
 * original, and measure where the recompression residual concentrates. Uniform residue
 * ~ untouched capture; residue that spikes in one region ~ a spliced / painted edit.
 *
 * This is a real signal computed from pixels — no model, no training data.
 */
export async function errorLevelAnalysis(input: Buffer): Promise<ElaResult> {
  const base = sharp(input, { failOn: 'none' }).rotate();
  const meta = await base.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error('Unsupported or corrupt image');

  const original = await base.clone().removeAlpha().raw().toBuffer();
  const recompressed = await sharp(
    await base.clone().jpeg({ quality: ANALYSIS_QUALITY }).toBuffer(),
    { failOn: 'none' },
  )
    .removeAlpha()
    .raw()
    .toBuffer();

  const channels = 3;
  const cellW = Math.max(1, Math.floor(width / GRID));
  const cellH = Math.max(1, Math.floor(height / GRID));
  const cellSum = Array.from({ length: GRID }, () => new Array(GRID).fill(0));
  const cellCount = Array.from({ length: GRID }, () => new Array(GRID).fill(0));

  const len = Math.min(original.length, recompressed.length);
  for (let i = 0; i + channels <= len; i += channels) {
    const px = (i / channels) % width;
    const py = Math.floor(i / channels / width);
    const gx = Math.min(GRID - 1, Math.floor(px / cellW));
    const gy = Math.min(GRID - 1, Math.floor(py / cellH));
    const d =
      Math.abs(original[i] - recompressed[i]) +
      Math.abs(original[i + 1] - recompressed[i + 1]) +
      Math.abs(original[i + 2] - recompressed[i + 2]);
    cellSum[gy][gx] += d;
    cellCount[gy][gx] += 1;
  }

  const means: number[][] = cellSum.map((row, y) => row.map((s, x) => (cellCount[y][x] ? s / cellCount[y][x] : 0)));
  const flat = means.flat();
  const max = Math.max(...flat, 1);
  const avg = flat.reduce((a, b) => a + b, 0) / flat.length;

  const heatmapMatrix = means.map((row) => row.map((v) => Number((v / max).toFixed(3))));

  let hotCell = { row: 0, col: 0, value: 0 };
  heatmapMatrix.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v > hotCell.value) hotCell = { row: y, col: x, value: v };
    }),
  );

  // Concentration ratio: peak residue vs. mean residue. 1 = flat (benign), >>1 = localised edit.
  const concentration = avg > 0 ? max / avg : 1;
  const elaScore = Math.round(Math.max(0, Math.min(100, (concentration - 1) * 45)));

  return { heatmapMatrix, elaScore, hotCell, gridRows: GRID, gridCols: GRID };
}
