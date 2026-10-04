import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getSettings } from '@/lib/settings';
import { markPaid, razorpayConfig, validCheckoutSignature } from '@/lib/payments';

/** Called by the browser after Razorpay Checkout succeeds; the signature proves the payment is genuine. */
export async function POST(req: Request) {
  let b: Record<string, string>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const orderId = String(b.razorpay_order_id ?? '');
  const paymentId = String(b.razorpay_payment_id ?? '');
  const signature = String(b.razorpay_signature ?? '');
  const cfg = razorpayConfig(await getSettings());
  if (!orderId || !paymentId || !cfg.secret || !validCheckoutSignature(cfg.secret, orderId, paymentId, signature)) {
    if (orderId) await db.update(schema.payments).set({ error: 'Signature check failed', updatedAt: new Date() }).where(eq(schema.payments.orderId, orderId));
    return NextResponse.json({ error: 'We could not verify this payment. If money was deducted, please contact us with your payment ID.' }, { status: 400 });
  }
  const p = await markPaid(orderId, paymentId);
  if (!p) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json({ ok: true, paymentId, amount: p.amount });
}
