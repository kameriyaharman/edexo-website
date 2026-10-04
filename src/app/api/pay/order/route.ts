import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { getSettings, s } from '@/lib/settings';
import { createRazorpayOrder, feeFor, getLead, parseLeadRef, payableFor, razorpayConfig } from '@/lib/payments';
import { leadId } from '@/lib/format';
import { rateLimited } from '@/lib/spam';

/** Creates a Razorpay order for the lead's course. The amount comes from the fee table, never from the browser. */
export async function POST(req: Request) {
  if (rateLimited(req, 'pay', 15)) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const id = parseLeadRef(String(body.ref ?? ''));
  const lead = id ? await getLead(id) : null;
  if (!lead) return NextResponse.json({ error: 'This link has expired. Please contact us.' }, { status: 404 });

  const st = await getSettings();
  const cfg = razorpayConfig(st);
  if (!cfg.enabled) return NextResponse.json({ error: 'Online payment is not available right now. Our team will contact you.' }, { status: 400 });

  const { items } = await payableFor(lead);
  const item = items.find((i) => i.course.id === Number(body.courseId));
  if (!item) return NextResponse.json({ error: 'Please choose a course.' }, { status: 400 });
  const mode = body.mode === 'Offline' ? 'Offline' : 'Online';
  const fee = feeFor(item.course, mode);
  if (!fee) return NextResponse.json({ error: 'The fee for this course is shared by our team. Please contact us.' }, { status: 400 });

  try {
    const order = await createRazorpayOrder(st, fee * 100, leadId(lead.id), {
      lead: leadId(lead.id), course: item.course.title, mode, name: lead.name.slice(0, 200), phone: lead.phone.slice(0, 40),
    });
    await db.insert(schema.payments).values({
      enquiryId: lead.id, courseId: item.course.id, courseTitle: item.course.title, mode, amount: order.amount, orderId: order.id,
      name: lead.name, email: lead.email ?? '', phone: lead.phone,
    });
    return NextResponse.json({
      key: cfg.keyId, orderId: order.id, amount: order.amount, currency: order.currency,
      name: s(st, 'paymentBrandName') || s(st, 'siteName', 'Edexo'), description: `${item.course.title} (${mode})`,
      prefill: { name: lead.name, email: lead.email || undefined, contact: lead.phone.replace(/[^\d+]/g, '') },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
