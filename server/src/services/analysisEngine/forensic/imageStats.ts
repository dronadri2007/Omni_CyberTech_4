import sharp from 'sharp';

export interface ImageStatsResult {
  width: number;
  height: number;
  channels: number;
  /** Mean per-pixel high-frequency (Laplacian-like) energy — proxy for sensor/grain noise. */
  noiseEnergy: number;
  /** 0..100 — very low noise on a photo-sized image is a GAN / heavy-denoise tell. */
  syntheticSmoothness: number;
  notes: string[];
}

/**
 * Lightweight spatial statistics: estimate high-frequency noise by differencing the
 * image with a 3x3 box blur. Camera sensors leave a characteristic noise floor;
 * diffusion/GAN output and aggressive AI denoise are unnaturally smooth for their size.
 */
export async function imageStats(buf: Buffer): Promise<ImageStatsResult> {
  const img = sharp(buf, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const gray = img.clone().greyscale();
  const raw = await gray.clone().raw().toBuffer();
  const blurred = await gray.clone().blur(1.2).raw().toBuffer();

  let acc = 0;
  const n = Math.min(raw.length, blurred.length);
  for (let i = 0; i < n; i++) acc += Math.abs(raw[i] - blurred[i]);
  const noiseEnergy = n ? acc / n : 0;

  const notes: string[] = [];
  const megapixels = (width * height) / 1_000_000;

  // Empirically, real JPEG captures sit ~1.5–8 on this scale; <0.8 on a >1MP image is suspicious.
  let syntheticSmoothness = 0;
  if (megapixels >= 0.5) {
    if (noiseEnergy < 0.8) {
      syntheticSmoothness = Math.round(Math.min(100, (0.8 - noiseEnergy) * 120 + 40));
      notes.push(`Unusually low sensor noise (${noiseEnergy.toFixed(2)}) for a ${megapixels.toFixed(1)}MP image.`);
    } else if (noiseEnergy < 1.3) {
      syntheticSmoothness = Math.round((1.3 - noiseEnergy) * 40);
      notes.push(`Below-typical noise floor (${noiseEnergy.toFixed(2)}).`);
    }
  }

  if (width && height) {
    const ar = width / height;
    if ([1, 1.5, 1.7778, 0.5625, 0.6667].every((r) => Math.abs(ar - r) > 0.02 && Math.abs(1 / ar - r) > 0.02) && (width % 64 === 0 && height % 64 === 0)) {
      notes.push(`Dimensions ${width}x${height} are exact multiples of 64 — typical of generative model output.`);
      syntheticSmoothness = Math.min(100, syntheticSmoothness + 15);
    }
  }

  return {
    width,
    height,
    channels: meta.channels ?? 3,
    noiseEnergy: Number(noiseEnergy.toFixed(3)),
    syntheticSmoothness,
    notes,
  };
}
