'use client';
import { useActionState } from 'react';
import { login } from '@/admin/actions';
import { keepValues } from '@/admin/Fields';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form onSubmit={keepValues(action)} className="a-form">
      {state?.error && <p className="a-msg err" role="alert">{state.error}</p>}
      <div className="a-fields">
        <div className="a-field">
          <label className="a-label" htmlFor="email">Email</label>
          <input className="a-input" id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div className="a-field">
          <label className="a-label" htmlFor="password">Password</label>
          <input className="a-input" id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
      </div>
      <button className="a-btn primary" type="submit" disabled={pending} style={{ justifyContent: 'center', padding: 12 }}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
