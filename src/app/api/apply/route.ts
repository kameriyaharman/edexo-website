import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { clip, botCheck, rateLimited, validEmail, validPhone } from '@/lib/spam';

const MAX = 5 * 1024 * 1024;
const OK_TYPES: Record<string, string> = {
  pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const EXTRA = ['city', 'position', 'qualification', 'experience', 'linkedin'];

/** Job applications (Careers page). The CV is stored privately in `files`; only admins can download it. */
export async function POST(req: Request) {
  if (rateLimited(req, 'apply', 4)) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  let fd: FormData;
  try { fd = await req.formData(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const get = (k: string, n = 200) => clip(fd.get(k), n);
  const bot = botCheck(get);
  if (bot === 'drop') return NextResponse.json({ ok: true });

  const name = get('name', 120);
  const phone = get('phone', 40);
  const email = get('email', 160);
  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!validEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  if (!validPhone(phone)) return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
  if (!get('position')) return NextResponse.json({ error: 'Please choose a position.' }, { status: 400 });

  const file = fd.get('resume');
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: 'Please attach your resume.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'Resume must be 5 MB or smaller.' }, { status: 400 });
  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  if (!OK_TYPES[ext]) return NextResponse.json({ error: 'Please upload a PDF or Word file.' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const isPdf = buf.subarray(0, 4).toString() === '%PDF';
  const isZip = buf[0] === 0x50 && buf[1] === 0x4b; // .docx
  const isOle = buf[0] === 0xd0 && buf[1] === 0xcf; // .doc
  if (!(ext === 'pdf' ? isPdf : ext === 'docx' ? isZip : isOle)) return NextResponse.json({ error: 'That file does not look like a valid PDF or Word document.' }, { status: 400 });

  const safeName = file.name.replace(/[^\w.\- ]+/g, '_').slice(-120);
  const [f] = await db.insert(schema.files).values({ filename: safeName, mime: OK_TYPES[ext], size: buf.length, data: buf }).returning({ id: schema.files.id });
  const extra: Record<string, string> = {};
  for (const k of EXTRA) { const v = get(k, 300); if (v) extra[k] = v; }
  await db.insert(schema.enquiries).values({
    type: 'career', name, phone, email, language: get('language', 80), course: get('position', 120), message: get('message', 3000),
    source: 'Careers page', pageUrl: get('pageUrl', 300), country: 'India', extra, fileId: f.id,
    notes: bot === 'flag' ? 'Possible spam: the hidden anti-spam field was filled (can also be browser AutoFill).' : '',
  });
  return NextResponse.json({ ok: true });
}
