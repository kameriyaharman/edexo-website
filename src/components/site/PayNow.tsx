'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { track } from '@/lib/track';

type Opt = { id: number; title: string; level: string; duration: string; online: number | null; offline: number | null };
type RzpResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: { error?: { description?: string } }) => void) => void } } }

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.src = 'https://checkout.razorpay.com/v1/checkout.js';
    sc.onload = () => res();
    sc.onerror = () => rej(new Error('Could not load the payment window. Check your internet connection.'));
    document.body.appendChild(sc);
  });
}

/** Course + fee summary and the Razorpay "Pay Now" button. The server decides the amount. */
export function PayNow({ leadRef, options, exact, defaultMode, note, paidText }: {
  leadRef: string; options: Opt[]; exact: boolean; defaultMode: 'Online' | 'Offline'; note?: string; paidText: string;
}) {
  const [courseId, setCourseId] = useState<number | null>(exact || options.length === 1 ? options[0].id : null);
  const course = options.find((o) => o.id === courseId) ?? null;
  const both = (o: Opt | null) => !!o && !!o.online && !!o.offline && o.online !== o.offline;
  const [mode, setMode] = useState<'Online' | 'Offline'>(defaultMode);
  const fee = course ? (mode === 'Offline' ? course.offline ?? course.online : course.online ?? course.offline) : null;
  const [state, setState] = useState<'idle' | 'busy' | 'paid' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  async function pay() {
    if (!course) return;
    setState('busy'); setMsg('');
    try {
      const [, r] = await Promise.all([loadCheckout(), fetch('/api/pay/order', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ref: leadRef, courseId: course.id, mode }),
      })]);
      const o = await r.json();
      if (!r.ok) throw new Error(o.error || 'Could not start the payment.');
      track('begin_checkout', { currency: 'INR', value: o.amount / 100, items: [{ item_name: course.title }] });
      const rzp = new window.Razorpay!({
        key: o.key, order_id: o.orderId, amount: o.amount, currency: o.currency, name: o.name, description: o.description,
        prefill: o.prefill, theme: { color: '#EE5A0F' },
        modal: { ondismiss: () => setState('idle') },
        handler: async (resp: RzpResponse) => {
          setState('busy');
          const v = await fetch('/api/pay/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(resp) });
          const j = await v.json().catch(() => ({}));
          if (!v.ok) { setState('err'); setMsg(j.error || 'Payment could not be verified.'); return; }
          track('purchase', { transaction_id: resp.razorpay_payment_id, currency: 'INR', value: o.amount / 100, items: [{ item_name: course.title }] });
          setState('paid'); setMsg(`Payment ID: ${resp.razorpay_payment_id}`);
        },
      });
      rzp.on('payment.failed', (e) => { setState('err'); setMsg(e.error?.description || 'Payment failed. Please try again.'); });
      rzp.open();
    } catch (e) {
      setState('err'); setMsg((e as Error).message);
    }
  }

  if (state === 'paid') {
    return (
      <div className="ty-paid">
        <span className="ty-paid-ic"><Icon name="checkCircle" size={26} /></span>
        <div><strong>Payment successful — {fee ? inr(fee) : ''} for {course?.title}</strong><span>{paidText} {msg}</span></div>
      </div>
    );
  }

  return (
    <div className="pay-box">
      <h3><Icon name="wallet" size={20} />Confirm your seat</h3>
      {!exact && options.length > 1 && (
        <label className="field pay-pick">Choose your level
          <span className="input-ic"><Icon name="layers" size={18} /></span>
          <select value={courseId ?? ''} onChange={(e) => setCourseId(Number(e.target.value) || null)}>
            <option value="">Select level</option>
            {options.map((o) => <option key={o.id} value={o.id}>{o.title}{o.duration ? ` · ${o.duration}` : ''}</option>)}
          </select>
        </label>
      )}
      {both(course) && (
        <div className="pay-modes" role="radiogroup" aria-label="Class mode">
          {(['Online', 'Offline'] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
              <Icon name={m === 'Online' ? 'laptop' : 'building'} size={16} />{m}<strong>{inr((m === 'Online' ? course!.online : course!.offline)!)}</strong>
            </button>
          ))}
        </div>
      )}
      {course && fee && (
        <div className="pay-total"><span>{course.title}{both(course) ? ` · ${mode}` : ''}</span><strong>{inr(fee)}</strong></div>
      )}
      <button type="button" className="btn btn-orange btn-lg full" onClick={pay} disabled={!course || !fee || state === 'busy'} data-cta="pay_now">
        <Icon name="shield" size={19} />{state === 'busy' ? 'Please wait…' : fee ? `Pay Now ${inr(fee)}` : 'Pay Now'}
      </button>
      {state === 'err' && <p className="form-msg err" role="alert"><Icon name="info" size={18} />{msg}</p>}
      <p className="pay-note"><Icon name="shield" size={14} />Secure payment by Razorpay — UPI, cards, net banking and wallets.{note ? ` ${note}` : ''}</p>
    </div>
  );
}
