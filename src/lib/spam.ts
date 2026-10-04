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
 * Bot checks. Returns:
 * - 'drop'  : almost certainly a script (submitted < 1.2 s after the page loaded) — fake success, nothing saved
 * - 'flag'  : the hidden trap field was filled — saved anyway (AutoFill can do this) but marked as possible spam
 * - false   : looks human
 */
export function botCheck(get: (k: string) => string): 'drop' | 'flag' | false {
  const t = Number(get('_t'));
  if (Number.isFinite(t) && t > 0 && t < 1200) return 'drop';
  if (get('edx_trap_x9') || get('website')) return 'flag';
  return false;
}

const URLS = /(https?:\/\/|www\.)/gi;
/** Messages stuffed with links are spam. */
export function spammyText(text: string) {
  return (text.match(URLS)?.length ?? 0) > 2;
}

export const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const validPhone = (p: string) => p.replace(/\D/g, '').length >= 7;
