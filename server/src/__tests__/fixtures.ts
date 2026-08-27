import sharp from 'sharp';

/** A noisy, photo-like JPEG — should read closer to authentic. */
export async function photoJpeg(): Promise<Buffer> {
  const w = 480;
  const h = 360;
  const raw = Buffer.alloc(w * h * 3);
  for (let i = 0; i < raw.length; i += 3) {
    const base = 90 + ((i / 3) % w) / 6;
    raw[i] = clamp(base + rand(24));
    raw[i + 1] = clamp(base + rand(24));
    raw[i + 2] = clamp(base + 20 + rand(24));
  }
  return sharp(raw, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 90 }).toBuffer();
}

/** A flat, ultra-smooth image at a model-typical resolution — should read more suspicious. */
export async function flatSynthPng(): Promise<Buffer> {
  return sharp({ create: { width: 1024, height: 1024, channels: 3, background: { r: 130, g: 150, b: 205 } } })
    .png()
    .toBuffer();
}

function rand(n: number) {
  return (Math.floor(Math.random() * (2 * n + 1)) - n);
}
function clamp(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}
