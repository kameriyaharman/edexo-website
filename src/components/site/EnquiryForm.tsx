'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icon';

export function EnquiryForm({ courses, branches, button, success, defaultCourse, source, withMessage, className }: {
  courses: string[]; branches: string[]; button: string; success: string;
  defaultCourse?: string; source: string; withMessage?: boolean; className?: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('sending');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, source }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not send. Please try again.');
      setState('ok');
      form.reset();
    } catch (err) {
      setError((err as Error).message);
      setState('err');
    }
  }

  const id = (n: string) => `${source.replace(/\W+/g, '-').toLowerCase()}-${n}`;
  return (
    <form className={className ?? 'card enquiry-form'} onSubmit={submit} noValidate={false}>
      {state === 'ok' && <p className="form-msg ok" role="status"><Icon name="checkCircle" size={18} />{success}</p>}
      {state === 'err' && <p className="form-msg err" role="alert"><Icon name="info" size={18} />{error}</p>}
      <label className="field" htmlFor={id('name')}>Full name
        <span className="input-ic"><Icon name="user" size={18} /></span><input id={id('name')} name="name" type="text" required autoComplete="name" placeholder="Your name" />
      </label>
      <label className="field" htmlFor={id('phone')}>Phone
        <span className="input-ic"><Icon name="phone" size={18} /></span><input id={id('phone')} name="phone" type="tel" required minLength={8} autoComplete="tel" placeholder="+91" />
      </label>
      <label className="field" htmlFor={id('course')}>Course
        <span className="input-ic"><Icon name="cap" size={18} /></span><select id={id('course')} name="course" defaultValue={defaultCourse ?? courses[0]}>
          {courses.map((c) => <option key={c}>{c}</option>)}
          <option>Not sure yet</option>
        </select>
      </label>
      <label className="field" htmlFor={id('branch')}>Branch
        <span className="input-ic"><Icon name="pin" size={18} /></span><select id={id('branch')} name="branch">
          {branches.map((b) => <option key={b}>{b}</option>)}
          <option>Online</option>
        </select>
      </label>
      {withMessage && (
        <>
          <label className="field full" htmlFor={id('email')}>Email (optional)
            <span className="input-ic"><Icon name="mail" size={18} /></span><input id={id('email')} name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          </label>
          <label className="field full" htmlFor={id('message')}>Message (optional)
            <span className="input-ic ta"><Icon name="chat" size={18} /></span><textarea id={id('message')} name="message" placeholder="Tell us about your goals" />
          </label>
        </>
      )}
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn btn-orange full" disabled={state === 'sending'} style={{ padding: 16 }}>
        {state === 'sending' ? 'Sending…' : <><Icon name="send" size={18} />{button}</>}
      </button>
    </form>
  );
}
