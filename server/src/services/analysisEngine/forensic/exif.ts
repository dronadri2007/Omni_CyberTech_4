import exifr from 'exifr';

export interface ExifResult {
  hasExif: boolean;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  software: string[];
  createdAt?: string;
  modifiedAt?: string;
  gps?: { lat: number; lon: number };
  raw: Record<string, unknown>;
  /** Human-readable red flags derived from the metadata. */
  inconsistencies: string[];
  /** 0..100 metadata-risk contribution. */
  metadataRisk: number;
}

const EDITOR_HINTS = [
  'photoshop',
  'gimp',
  'lightroom',
  'affinity',
  'pixelmator',
  'after effects',
  'premiere',
  'ffmpeg',
  'stable diffusion',
  'midjourney',
  'dall',
  'firefly',
  'topaz',
];

export async function readExif(buf: Buffer): Promise<ExifResult> {
  let data: Record<string, unknown> = {};
  try {
    // `true` = parse every supported metadata segment (EXIF/TIFF/XMP/GPS/IPTC/ICC).
    data = ((await exifr.parse(buf, true)) as Record<string, unknown> | undefined) ?? {};
  } catch {
    data = {};
  }

  const software: string[] = [];
  const pushSoft = (v: unknown) => {
    if (typeof v === 'string' && v.trim()) software.push(v.trim());
  };
  pushSoft(data.Software);
  pushSoft((data as Record<string, unknown>).CreatorTool);
  pushSoft((data as Record<string, unknown>).HistorySoftwareAgent);

  const make = typeof data.Make === 'string' ? data.Make.trim() : undefined;
  const model = typeof data.Model === 'string' ? data.Model.trim() : undefined;
  const lens = typeof (data as Record<string, unknown>).LensModel === 'string' ? String((data as Record<string, unknown>).LensModel) : undefined;

  const toIso = (v: unknown): string | undefined => {
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString();
    if (typeof v === 'string') {
      const d = new Date(v.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
      return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
    }
    return undefined;
  };
  const createdAt = toIso(data.DateTimeOriginal ?? data.CreateDate);
  const modifiedAt = toIso(data.ModifyDate ?? (data as Record<string, unknown>).MetadataDate);

  const gps =
    typeof (data as Record<string, unknown>).latitude === 'number' && typeof (data as Record<string, unknown>).longitude === 'number'
      ? { lat: Number((data as Record<string, unknown>).latitude), lon: Number((data as Record<string, unknown>).longitude) }
      : undefined;

  const hasExif = Object.keys(data).length > 0;
  const inconsistencies: string[] = [];
  let metadataRisk = hasExif ? 12 : 33;

  if (!hasExif) inconsistencies.push('No EXIF metadata present — stripped on export or synthetically generated.');

  const editors = software.filter((s) => EDITOR_HINTS.some((h) => s.toLowerCase().includes(h)));
  if (editors.length) {
    inconsistencies.push(`Editing software in metadata: ${editors.join(', ')}.`);
    metadataRisk += 25;
    if (editors.some((s) => /stable diffusion|midjourney|dall|firefly/i.test(s))) {
      inconsistencies.push('Generative-AI tool signature found in metadata.');
      metadataRisk += 30;
    }
  }

  if (createdAt && modifiedAt) {
    const gap = new Date(modifiedAt).getTime() - new Date(createdAt).getTime();
    if (gap > 60_000) {
      inconsistencies.push(`File modified ${Math.round(gap / 1000)}s after capture.`);
      metadataRisk += 10;
    }
  }

  if (make && !model) {
    inconsistencies.push('Camera make present without a model — partially forged EXIF header.');
    metadataRisk += 15;
  }

  return {
    hasExif,
    cameraMake: make,
    cameraModel: model,
    lens,
    software,
    createdAt,
    modifiedAt,
    gps,
    raw: data,
    inconsistencies,
    metadataRisk: Math.max(0, Math.min(100, Math.round(metadataRisk))),
  };
}
