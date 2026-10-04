import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getSettings } from '@/lib/settings';
import { markPaid, razorpayConfig, validWebhookSignature } from '@/lib/payments';

/** Razorpay webhook: records payments even if the student closes the browser before returning. */
export async function POST(req: Request) {
  const raw = await req.text();
  const cfg = razorpayConfig(await getSettings());
  if (!cfg.webhookSecret || !validWebhookSignature(cfg.webhookSecret, raw, req.headers.get('x-razorpay-signature') ?? '')) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }
  let evt: { event?: string; payload?: { payment?: { entity?: Record<string, string> } } };
  try { evt = JSON.parse(raw); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const pay = evt.payload?.payment?.entity;
  if (pay?.order_id) {
    if (evt.event === 'payment.captured' || evt.event === 'order.paid') await markPaid(pay.order_id, pay.id, pay.method ?? '');
    else if (evt.event === 'payment.failed') {
      await db.update(schema.payments).set({ error: String(pay.error_description ?? 'Payment failed').slice(0, 300), paymentId: pay.id, updatedAt: new Date() })
        .where(eq(schema.payments.orderId, pay.order_id));
    }
  }
  return NextResponse.json({ ok: true });
}
