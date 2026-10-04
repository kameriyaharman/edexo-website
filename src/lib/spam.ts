import 'server-only';

// Small in-memory rate limit per container: `max` submissions per 10 minutes per IP and bucket.
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, bucket: string, max = 8) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}

/**
 * Bot checks: a hidden "website" field humans never fill, and a time trap —
 * forms submitted less than 2.5 s after the page loaded are almost always bots.
 * Bots get a fake success so they don't retry.
 */
export function looksLikeBot(get: (k: string) => string) {
  if (get('website')) return true;
  const t = Number(get('_t'));
  return Number.isFinite(t) && t > 0 && t < 2500;
}

const URLS = /(https?:\/\/|www\.)/gi;
/** Messages stuffed with links are spam. */
export function spammyText(text: string) {
  return (text.match(URLS)?.length ?? 0) > 2;
}

export const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const validPhone = (p: string) => p.replace(/\D/g, '').length >= 7;
