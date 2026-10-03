import { NextResponse } from 'next/server';
import { db, schema } from '@/db';

// very small in-memory rate limit (per container): 8 submissions / 10 min / IP
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 8;
}

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return NextResponse.json({ error: 'Too many requests. Please call us instead.' }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  if (clip(body.website, 200)) return NextResponse.json({ ok: true }); // honeypot: silently accept bots

  const name = clip(body.name, 120);
  const phone = clip(body.phone, 30);
  const email = clip(body.email, 160);
  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (phone.replace(/\D/g, '').length < 8) return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });

  await db.insert(schema.enquiries).values({
    name, phone, email,
    course: clip(body.course, 120), branch: clip(body.branch, 120),
    message: clip(body.message, 3000), source: clip(body.source, 80),
  });
  return NextResponse.json({ ok: true });
}
