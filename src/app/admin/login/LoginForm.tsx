'use client';
import { useActionState } from 'react';
import { login } from '@/admin/actions';
import { keepValues } from '@/admin/Fields';
import { Icon } from '@/components/Icon';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form onSubmit={keepValues(action)} className="a-form">
      {state?.error && <p className="a-msg err" role="alert"><Icon name="info" size={18} />{state.error}</p>}
      <div className="a-fields">
        <div className="a-field">
          <label className="a-label" htmlFor="email">Email</label>
          <div className="a-input-ic"><Icon name="mail" size={18} /><input className="a-input" id="email" name="email" type="email" required autoComplete="username" placeholder="you@edexo.in" /></div>
        </div>
        <div className="a-field">
          <label className="a-label" htmlFor="password">Password</label>
          <div className="a-input-ic"><Icon name="shield" size={18} /><input className="a-input" id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" /></div>
        </div>
      </div>
      <button className="a-btn primary" type="submit" disabled={pending} style={{ padding: 14, fontSize: 15 }}>
        {pending ? 'Signing in…' : <>Sign in<Icon name="arrowRight" size={17} /></>}
      </button>
    </form>
  );
}
