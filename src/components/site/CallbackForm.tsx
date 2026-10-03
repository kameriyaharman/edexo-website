'use client';
import { useState } from 'react';

export function CallbackForm({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState('sending');
    const res = await fetch('/api/enquiry', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Call-back request', phone: fd.get('phone'), source: 'Footer call-back', website: fd.get('website') }),
    }).catch(() => null);
    setState(res?.ok ? 'ok' : 'err');
  }
  if (state === 'ok') return <p style={{ fontSize: 14, color: '#fff' }}>Thanks! We will call you back soon.</p>;
  return (
    <form onSubmit={submit}>
      <label style={{ fontSize: 13, display: 'block' }} htmlFor="cb-phone">{text}</label>
      <div className="callback">
        <input id="cb-phone" name="phone" type="tel" required minLength={8} placeholder="Your phone number" autoComplete="tel" />
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? '…' : 'Call me'}</button>
      </div>
      {state === 'err' && <p style={{ fontSize: 13, color: '#FFB4A0', marginTop: 8 }}>Something went wrong. Please call us instead.</p>}
    </form>
  );
}
