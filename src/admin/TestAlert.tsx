'use client';

import { useActionState } from 'react';
import { sendTestAlert } from './actions';
import { Icon } from '@/components/Icon';

export function TestAlert() {
  const [state, action, pending] = useActionState(sendTestAlert, undefined);
  return (
    <form action={action} className="a-card" style={{ marginTop: 20, padding: 20 }}>
      <h3 style={{ margin: '0 0 6px' }}>Test the alerts</h3>
      <p className="a-help" style={{ margin: '0 0 12px' }}>Uses the saved settings above (save first). Sends a sample lead even if the switches are off.</p>
      <div className="a-field" style={{ maxWidth: 420, marginBottom: 12 }}>
        <label htmlFor="testTo">Send email tests to (optional)</label>
        <input id="testTo" name="testTo" type="email" placeholder="you@example.com" />
        <small className="a-help">Empty = the "Send lead alerts to" addresses. Needed for the auto-reply test.</small>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="a-btn" name="channel" value="email" disabled={pending}><Icon name="mail" size={15} />Test lead email</button>
        <button className="a-btn" name="channel" value="student" disabled={pending}><Icon name="mail" size={15} />Test student auto-reply</button>
        <button className="a-btn" name="channel" value="payment" disabled={pending}><Icon name="mail" size={15} />Test payment email</button>
        <button className="a-btn" name="channel" value="whatsapp" disabled={pending}><Icon name="chat" size={15} />Test WhatsApp</button>
        <button className="a-btn" name="channel" value="telegram" disabled={pending}><Icon name="send" size={15} />Test Telegram</button>
        <button className="a-btn" name="channel" value="chatids" disabled={pending}><Icon name="search" size={15} />Find Telegram chat IDs</button>
      </div>
      {pending && <p className="a-help" style={{ marginTop: 10 }}>Sending…</p>}
      {!pending && state?.ok && <p style={{ marginTop: 10, color: '#1a7f37' }}>{state.ok}</p>}
      {!pending && state?.error && <p style={{ marginTop: 10, color: '#c62828', wordBreak: 'break-word' }}>{state.error}</p>}
    </form>
  );
}
