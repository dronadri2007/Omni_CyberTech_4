import type { ProvenanceStatus } from '../../../types';

export interface C2paResult {
  status: ProvenanceStatus;
  present: boolean;
  verified: boolean;
  issuer?: string;
  claimGenerator?: string;
  signedAt?: string;
  detail: string;
}

/**
 * C2PA / Content Credentials probe.
 *
 * If the optional native library `c2pa-node` is installed it is used to
 * cryptographically validate the manifest. Otherwise we fall back to detecting
 * the JUMBF / `c2pa` box in the container bytes, which tells us a manifest is
 * *present* but leaves it *unverified* — reported honestly as such.
 */
export async function verifyC2pa(buf: Buffer, mimeType: string): Promise<C2paResult> {
  // 1. Try real cryptographic verification via an optional dependency.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('c2pa-node') as {
      createC2pa: () => { read: (a: { buffer: Buffer; mimeType: string }) => Promise<unknown> };
    };
    const c2pa = mod.createC2pa();
    const result = (await c2pa.read({ buffer: buf, mimeType })) as
      | null
      | {
          active_manifest?: string;
          manifests?: Record<string, { claim_generator?: string; signature_info?: { issuer?: string; time?: string } }>;
          validation_status?: Array<{ code: string }>;
        };

    if (!result || !result.active_manifest) {
      return { status: 'NOT_VERIFIED', present: false, verified: false, detail: 'No C2PA manifest embedded.' };
    }
    const manifest = result.manifests?.[result.active_manifest];
    const errors = (result.validation_status ?? []).filter((v) => !/^(claimSignature\.validated|signingCredential\.trusted)$/.test(v.code));
    const verified = errors.length === 0;
    return {
      status: verified ? 'VERIFIED' : 'SUSPICIOUS',
      present: true,
      verified,
      issuer: manifest?.signature_info?.issuer,
      claimGenerator: manifest?.claim_generator,
      signedAt: manifest?.signature_info?.time,
      detail: verified
        ? 'C2PA manifest cryptographically validated.'
        : `C2PA manifest present but failed validation: ${errors.map((e) => e.code).join(', ')}.`,
    };
  } catch {
    /* fall through to byte-marker heuristic */
  }

  // 2. Byte-marker fallback — detect the JUMBF superbox / `c2pa` type.
  const head = buf.subarray(0, Math.min(buf.length, 5_000_000));
  const hasJumbf = head.includes(Buffer.from('jumb')) && head.includes(Buffer.from('c2pa'));
  const hasContentCred = head.includes(Buffer.from('contentauth')) || head.includes(Buffer.from('c2pa.org'));

  if (hasJumbf || hasContentCred) {
    return {
      status: 'SUSPICIOUS',
      present: true,
      verified: false,
      detail: 'C2PA manifest detected in container but not cryptographically verified (install c2pa-node for full validation).',
    };
  }

  return {
    status: mimeType.startsWith('image/') || mimeType.startsWith('video/') ? 'NOT_VERIFIED' : 'UNAVAILABLE',
    present: false,
    verified: false,
    detail: 'No Content Credentials / C2PA manifest found.',
  };
}
