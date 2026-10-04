import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { leadRef } from '@/lib/payments';
import { clip, botCheck, rateLimited, spammyText, validEmail, validPhone } from '@/lib/spam';

const TYPES = ['enquiry', 'demo', 'international', 'franchise'];
const FRANCHISE_EXTRA = ['city', 'state', 'business', 'investment', 'location', 'experience'];

export async function POST(req: Request) {
  if (rateLimited(req, 'enquiry')) return NextResponse.json({ error: 'Too many requests. Please call or WhatsApp us instead.' }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const get = (k: string, n = 200) => clip(body[k], n);

  const bot = botCheck(get);
  if (bot === 'drop') return NextResponse.json({ ok: true });

  const name = get('name', 120);
  const phone = get('phone', 40);
  const email = get('email', 160);
  const message = get('message', 3000);
  let type = get('type', 20);
  if (!TYPES.includes(type)) type = 'enquiry';
  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!validPhone(phone)) return NextResponse.json({ error: 'Please enter a valid phone / WhatsApp number.' }, { status: 400 });
  if (email && !validEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  if (type === 'franchise' && !email) return NextResponse.json({ error: 'Please enter your email.' }, { status: 400 });
  if (spammyText(message)) return NextResponse.json({ ok: true });

  const country = get('country', 80);
  if (type !== 'franchise' && country && country !== 'India') type = 'international';
  const extra: Record<string, string> = {};
  if (type === 'franchise') for (const k of FRANCHISE_EXTRA) { const v = get(k, 300); if (v) extra[k] = v; }

  const [row] = await db.insert(schema.enquiries).values({
    type: type === 'demo' ? 'enquiry' : type, name, phone, email, country, message,
    language: get('language', 80), level: get('level', 40), course: get('course', 120) || (type === 'demo' ? 'Free demo' : ''),
    courseType: get('courseType', 80), mode: get('mode', 20), format: get('format', 20), exam: get('exam', 60),
    timing: get('timing', 40), timezone: get('timezone', 60), branch: get('branch', 80),
    source: get('source', 80) || 'Website', pageUrl: get('pageUrl', 300), extra,
    notes: bot === 'flag' ? 'Possible spam: the hidden anti-spam field was filled (can also be browser AutoFill).' : '',
  }).returning({ id: schema.enquiries.id });
  // demo / course / international enquiries continue to the Thank-you (and Pay Now) page
  return NextResponse.json({ ok: true, ...(type !== 'franchise' ? { next: `/thank-you/${leadRef(row.id)}` } : {}) });
}
