import 'server-only';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getSettings, s, type Settings } from '@/lib/settings';
import { getCourses, getPrograms, type CourseRow } from '@/lib/data';

/* ---------- signed, unguessable thank-you references (no lead data in the URL) ---------- */
function key() {
  const k = process.env.SESSION_SECRET;
  if (!k) throw new Error('SESSION_SECRET is not set');
  return k;
}
const mac = (v: string) => crypto.createHmac('sha256', key()).update(`lead:${v}`).digest('base64url').slice(0, 22);

export function leadRef(id: number) {
  return `${id.toString(36)}-${mac(String(id))}`;
}
export function parseLeadRef(ref: string): number | null {
  const m = /^([0-9a-z]{1,10})-([\w-]{22})$/.exec(ref ?? '');
  if (!m) return null;
  const id = parseInt(m[1], 36);
  const good = mac(String(id));
  return crypto.timingSafeEqual(Buffer.from(good), Buffer.from(m[2])) ? id : null;
}

/* ---------- Razorpay ---------- */
export function razorpayConfig(st: Settings) {
  const keyId = s(st, 'razorpayKeyId').trim();
  const secret = s(st, 'razorpayKeySecret').trim();
  const enabled = st.razorpayEnabled === true && /^rzp_(test|live)_\w+$/.test(keyId) && secret.length > 8;
  return { enabled, keyId, secret, webhookSecret: s(st, 'razorpayWebhookSecret').trim(), test: keyId.startsWith('rzp_test_') };
}

export async function createRazorpayOrder(st: Settings, amountPaise: number, receipt: string, notes: Record<string, string>) {
  const cfg = razorpayConfig(st);
  if (!cfg.enabled) throw new Error('Online payment is not available right now.');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Basic ' + Buffer.from(`${cfg.keyId}:${cfg.secret}`).toString('base64') },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt: receipt.slice(0, 40), notes }),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.id) {
    console.error('[razorpay] order failed', res.status, json?.error?.description);
    throw new Error('Could not start the payment. Please try again or contact us.');
  }
  return json as { id: string; amount: number; currency: string };
}

const safeEq = (a: string, b: string) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function validCheckoutSignature(secret: string, orderId: string, paymentId: string, signature: string) {
  const exp = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEq(exp, signature ?? '');
}
export function validWebhookSignature(secret: string, body: string, signature: string) {
  const exp = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return safeEq(exp, signature ?? '');
}

/** Mark an order paid (idempotent) and move the lead to Converted. */
export async function markPaid(orderId: string, paymentId: string, method = '') {
  const [p] = await db.select().from(schema.payments).where(eq(schema.payments.orderId, orderId)).limit(1);
  if (!p) return null;
  if (p.status !== 'paid') {
    await db.update(schema.payments).set({ status: 'paid', paymentId, method, error: '', updatedAt: new Date() }).where(eq(schema.payments.id, p.id));
    if (p.enquiryId) {
      const [e] = await db.select({ notes: schema.enquiries.notes }).from(schema.enquiries).where(eq(schema.enquiries.id, p.enquiryId)).limit(1);
      const line = `Paid ₹${(p.amount / 100).toLocaleString('en-IN')} online for ${p.courseTitle} (${paymentId}) on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
      await db.update(schema.enquiries).set({ status: 'converted', notes: [e?.notes, line].filter(Boolean).join('\n'), updatedAt: new Date() })
        .where(eq(schema.enquiries.id, p.enquiryId));
    }
  }
  return p;
}

/* ---------- what the student enrolled for ---------- */
export type Payable = { course: CourseRow; online: number | null; offline: number | null };

/** Courses the thank-you page offers: the exact course if known, else every level of the chosen language. */
export async function payableFor(lead: { course: string | null; language: string | null }): Promise<{ exact: boolean; items: Payable[] }> {
  const courses = await getCourses();
  const map = (c: CourseRow): Payable => ({ course: c, online: c.price, offline: c.priceOffline });
  const title = (lead.course ?? '').trim().toLowerCase();
  const exact = title ? courses.find((c) => c.title.toLowerCase() === title) : undefined;
  if (exact) return { exact: true, items: [map(exact)] };
  const lang = (lead.language ?? '').trim().toLowerCase();
  if (!lang) return { exact: false, items: [] };
  const programs = await getPrograms();
  const progs = lang.startsWith('kids')
    ? programs.filter((p) => p.category === 'kids')
    : programs.filter((p) => p.category !== 'kids' && p.name.toLowerCase() === lang);
  return { exact: false, items: progs.flatMap((p) => p.courses).map(map) };
}

/** The fee charged for a course and mode — always computed on the server from the admin's fee table. */
export function feeFor(c: CourseRow, mode: string): number | null {
  const n = mode === 'Offline' ? c.priceOffline ?? c.price : c.price ?? c.priceOffline;
  return typeof n === 'number' && n > 0 ? n : null;
}

export async function getLead(id: number) {
  const [e] = await db.select().from(schema.enquiries).where(eq(schema.enquiries.id, id)).limit(1);
  return e ?? null;
}

export { getSettings };
