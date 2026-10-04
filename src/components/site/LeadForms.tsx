'use client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { countries } from '@/lib/countries';
import { trackLead } from '@/lib/track';

/* ---------- shared bits ---------- */
type Status = 'idle' | 'sending' | 'ok' | 'err';

function useSubmit(endpoint: string, type: string, source: string) {
  const [state, setState] = useState<Status>('idle');
  const [error, setError] = useState('');
  const started = useRef(0);
  useEffect(() => { started.current = Date.now(); }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>, multipart = false) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set('type', String(fd.get('type') || type));
    fd.set('source', source);
    fd.set('_t', String(Date.now() - started.current));
    fd.set('pageUrl', window.location.pathname + window.location.search);
    try { fd.set('timezone', String(fd.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone || '')); } catch { /* */ }
    const dial = String(fd.get('dial') || '').trim();
    const num = String(fd.get('phone') || '').trim();
    if (dial && num && !num.startsWith('+')) fd.set('phone', `${dial} ${num.replace(/^0+/, '')}`);
    fd.delete('dial');
    setState('sending');
    try {
      const res = await fetch(endpoint, multipart
        ? { method: 'POST', body: fd }
        : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(fd.entries())) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not send. Please try again.');
      trackLead(String(fd.get('type')), { language: String(fd.get('language') || ''), form_source: source });
      if (typeof json.next === 'string' && json.next.startsWith('/thank-you/')) {
        // short pause so analytics events are sent before leaving the page
        setTimeout(() => window.location.assign(json.next), 350);
        setState('sending');
        return;
      }
      setState('ok');
      form.reset();
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      setError((err as Error).message);
      setState('err');
    }
  }
  return { state, error, submit };
}

function F({ label, icon, full, children, htmlFor }: { label: string; icon?: string; full?: boolean; children: React.ReactNode; htmlFor: string }) {
  return (
    <label className={`field${full ? ' full' : ''}`} htmlFor={htmlFor}>{label}
      {icon && <span className={`input-ic${icon === 'chat' ? ' ta' : ''}`}><Icon name={icon} size={18} /></span>}
      {children}
    </label>
  );
}

function Sel({ id, name, options, value, placeholder, onChange, required }: {
  id: string; name: string; options: string[]; value?: string; placeholder?: string; onChange?: (v: string) => void; required?: boolean;
}) {
  return (
    <select id={id} name={name} defaultValue={value ?? ''} required={required} onChange={onChange ? (e) => onChange(e.target.value) : undefined}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Msg({ state, error, success }: { state: Status; error: string; success: string }) {
  if (state === 'ok') return <p className="form-msg ok" role="status"><Icon name="checkCircle" size={18} />{success}</p>;
  if (state === 'err') return <p className="form-msg err" role="alert"><Icon name="info" size={18} />{error}</p>;
  return null;
}

function Honeypot() {
  // deliberately meaningless name so browser AutoFill (Safari contact card, Chrome) never fills it
  return (
    <div className="hp" aria-hidden="true">
      <label>Leave this empty<input name="edx_trap_x9" type="text" tabIndex={-1} autoComplete="new-password" defaultValue="" data-lpignore="true" data-1p-ignore="true" /></label>
    </div>
  );
}

function PhoneField({ id, label = 'WhatsApp number', country, required = true }: { id: string; label?: string; country: string; required?: boolean }) {
  const dial = countries.find(([c]) => c === country)?.[1] ?? '+91';
  const dials = [...new Set(countries.map(([, d]) => d).filter(Boolean))].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  return (
    <label className="field phone-field" htmlFor={id}>{label}
      <span className="phone-row">
        <select name="dial" aria-label="Country code" defaultValue={dial} key={dial}>
          {dials.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="phone-input"><span className="input-ic"><Icon name="whatsapp" size={18} /></span>
          <input id={id} name="phone" type="tel" required={required} minLength={6} autoComplete="tel-national" inputMode="tel" placeholder="98765 43210" />
        </span>
      </span>
    </label>
  );
}

/* ---------- options ---------- */
export const LEVELS = ['Complete beginner', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Not sure'];
export const COURSE_TYPES = ['Language course', 'Exam preparation', 'Kids batch (8–16)', 'Spoken / Business English', 'Corporate training', 'Study / work abroad preparation'];
export const EXAMS = ['Not needed', 'Goethe', 'TELC', 'ÖSD', 'TestDaF', 'IELTS', 'PTE', 'TOEFL', 'DELF / DALF', 'TCF', 'DELE / SIELE', 'JLPT', 'HSK', 'Other'];
export const TIMINGS = ['Morning', 'Afternoon', 'Evening', 'Weekend', 'Flexible'];

export type LeadFormProps = {
  source: string; languages: string[]; branches: string[]; button?: string; success?: string;
  variant?: 'full' | 'compact'; type?: 'enquiry' | 'demo' | 'international';
  defaultLanguage?: string; defaultCourse?: string; defaultExam?: string; defaultFormat?: string; className?: string;
};

/** Main lead form: free demo, course enquiry and international student enquiry. */
export function LeadForm(p: LeadFormProps) {
  const variant = p.variant ?? 'full';
  const intl = p.type === 'international';
  const [country, setCountry] = useState(intl ? '' : 'India');
  const [mode, setMode] = useState(intl ? 'Online' : '');
  const { state, error, submit } = useSubmit('/api/enquiry', p.type ?? 'enquiry', p.source);
  const id = (n: string) => `${p.source.replace(/\W+/g, '-').toLowerCase()}-${n}`;
  const outside = country && country !== 'India';
  const success = p.success ?? 'Thank you! Our team will contact you shortly on WhatsApp or phone.';

  return (
    <form className={p.className ?? `card enquiry-form${variant === 'full' ? ' lead-full' : ''}`} onSubmit={(e) => submit(e)}>
      <Msg state={state} error={error} success={success} />
      <input type="hidden" name="type" value={intl || outside ? 'international' : p.type === 'demo' ? 'demo' : 'enquiry'} />
      {p.defaultCourse && <input type="hidden" name="course" value={p.defaultCourse} />}
      <F label="Full name" icon="user" htmlFor={id('name')}><input id={id('name')} name="name" type="text" required autoComplete="name" placeholder="Your name" /></F>
      <F label="Country" icon="globe" htmlFor={id('country')}>
        <Sel id={id('country')} name="country" options={countries.map(([c]) => c)} value={country} placeholder={intl ? 'Select your country' : undefined} onChange={setCountry} required={intl} />
      </F>
      <PhoneField id={id('phone')} country={country || 'India'} />
      {variant === 'full' && <F label="Email" icon="mail" htmlFor={id('email')}><input id={id('email')} name="email" type="email" autoComplete="email" placeholder="you@example.com" /></F>}
      <F label="Language interested in" icon="languages" htmlFor={id('language')}>
        <Sel id={id('language')} name="language" options={[...p.languages, 'Not sure yet']} value={p.defaultLanguage} placeholder="Select a language" required />
      </F>
      {variant === 'full' && <F label="Current level" icon="layers" htmlFor={id('level')}><Sel id={id('level')} name="level" options={LEVELS} placeholder="Select level" /></F>}
      {variant === 'full' && <F label="Course type" icon="cap" htmlFor={id('courseType')}><Sel id={id('courseType')} name="courseType" options={COURSE_TYPES} value={p.defaultExam ? 'Exam preparation' : undefined} placeholder="Select course type" /></F>}
      <F label="Online / Offline" icon="laptop" htmlFor={id('mode')}><Sel id={id('mode')} name="mode" options={['Online', 'Offline']} value={mode} placeholder="Select" onChange={setMode} /></F>
      {mode === 'Offline' && p.branches.length > 0 && (
        <F label="Preferred centre" icon="pin" htmlFor={id('branch')}><Sel id={id('branch')} name="branch" options={p.branches} /></F>
      )}
      {variant === 'full' && <F label="Group / One-to-One" icon="users" htmlFor={id('format')}><Sel id={id('format')} name="format" options={['Group', 'One-to-One']} value={p.defaultFormat} placeholder="Select" /></F>}
      {variant === 'full' && <F label="Exam preparation" icon="target" htmlFor={id('exam')}><Sel id={id('exam')} name="exam" options={EXAMS} value={p.defaultExam} placeholder="Select exam (if any)" /></F>}
      {variant === 'full' && <F label="Preferred class timing" icon="clock" htmlFor={id('timing')}><Sel id={id('timing')} name="timing" options={TIMINGS} placeholder="Select timing" /></F>}
      {(variant === 'full' || intl) && (outside || intl) && (
        <F label="Your time zone" icon="calendar" htmlFor={id('timezone')}><input id={id('timezone')} name="timezone" type="text" placeholder="e.g. Europe/Berlin" defaultValue="" /></F>
      )}
      {variant === 'full' && <F label="Message" icon="chat" full htmlFor={id('message')}><textarea id={id('message')} name="message" placeholder="Tell us your goal — study, work, exam, travel…" /></F>}
      <Honeypot />
      <button type="submit" className="btn btn-orange full" disabled={state === 'sending'} style={{ padding: 16 }}>
        {state === 'sending' ? 'Sending…' : <><Icon name="send" size={18} />{p.button ?? 'Book Free Demo'}</>}
      </button>
      <p className="form-note full"><Icon name="shield" size={14} />We only use your details to contact you about your enquiry.</p>
    </form>
  );
}

/** Franchise enquiry. */
export function FranchiseForm() {
  const [country, setCountry] = useState('India');
  const { state, error, submit } = useSubmit('/api/enquiry', 'franchise', 'Franchise page');
  const id = (n: string) => `fr-${n}`;
  return (
    <form className="card enquiry-form lead-full" onSubmit={(e) => submit(e)}>
      <Msg state={state} error={error} success="Thank you for your interest! Our franchise team will get in touch with you." />
      <F label="Full name" icon="user" htmlFor={id('name')}><input id={id('name')} name="name" required autoComplete="name" placeholder="Your name" /></F>
      <PhoneField id={id('phone')} label="Phone / WhatsApp" country={country} />
      <F label="Email" icon="mail" htmlFor={id('email')}><input id={id('email')} name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></F>
      <F label="City" icon="pin" htmlFor={id('city')}><input id={id('city')} name="city" required placeholder="City" /></F>
      <F label="State" icon="navigation" htmlFor={id('state')}><input id={id('state')} name="state" placeholder="State" /></F>
      <F label="Country" icon="globe" htmlFor={id('country')}><Sel id={id('country')} name="country" options={countries.map(([c]) => c)} value={country} onChange={setCountry} /></F>
      <F label="Current business / profession" icon="briefcase" htmlFor={id('business')}><input id={id('business')} name="business" placeholder="e.g. Coaching institute, trainer, consultant" /></F>
      <F label="Investment capacity" icon="wallet" htmlFor={id('investment')}><Sel id={id('investment')} name="investment" options={['Up to ₹5 lakh', '₹5–10 lakh', '₹10–25 lakh', 'Above ₹25 lakh', 'Prefer to discuss']} placeholder="Select" /></F>
      <F label="Preferred location for the centre" icon="building" htmlFor={id('location')}><input id={id('location')} name="location" placeholder="Area / city" /></F>
      <F label="Education / business experience" icon="award" htmlFor={id('experience')}><input id={id('experience')} name="experience" placeholder="Brief summary" /></F>
      <F label="Message" icon="chat" full htmlFor={id('message')}><textarea id={id('message')} name="message" placeholder="Anything you would like us to know" /></F>
      <Honeypot />
      <button type="submit" className="btn btn-orange full" disabled={state === 'sending'} style={{ padding: 16 }}>
        {state === 'sending' ? 'Sending…' : <><Icon name="handshake" size={18} />Send Franchise Enquiry</>}
      </button>
    </form>
  );
}

/** Job application with CV upload. */
export function CareerForm({ positions, languages }: { positions: string[]; languages: string[] }) {
  const [file, setFile] = useState('');
  const { state, error, submit } = useSubmit('/api/apply', 'career', 'Careers page');
  const id = (n: string) => `job-${n}`;
  return (
    <form className="card enquiry-form lead-full" onSubmit={(e) => submit(e, true)} encType="multipart/form-data">
      <Msg state={state} error={error} success="Thank you! Your application has been received. Our team will contact you if your profile matches an opening." />
      <F label="Full name" icon="user" htmlFor={id('name')}><input id={id('name')} name="name" required autoComplete="name" placeholder="Your name" /></F>
      <F label="Email" icon="mail" htmlFor={id('email')}><input id={id('email')} name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></F>
      <PhoneField id={id('phone')} label="Phone / WhatsApp" country="India" />
      <F label="City" icon="pin" htmlFor={id('city')}><input id={id('city')} name="city" placeholder="City" /></F>
      <F label="Position" icon="briefcase" htmlFor={id('position')}><Sel id={id('position')} name="position" options={[...positions, 'General application']} placeholder="Select position" required /></F>
      <F label="Language / department" icon="languages" htmlFor={id('language')}><Sel id={id('language')} name="language" options={[...languages, 'Counselling', 'Sales', 'Marketing', 'Operations']} placeholder="Select" /></F>
      <F label="Qualification" icon="cap" htmlFor={id('qualification')}><input id={id('qualification')} name="qualification" placeholder="e.g. B2/C1 certificate, degree" /></F>
      <F label="Experience" icon="award" htmlFor={id('experience')}><input id={id('experience')} name="experience" placeholder="e.g. 3 years teaching" /></F>
      <F label="LinkedIn profile" icon="external" htmlFor={id('linkedin')}><input id={id('linkedin')} name="linkedin" type="url" placeholder="https://linkedin.com/in/…" /></F>
      <label className="field upload-field" htmlFor={id('resume')}>Resume / CV (PDF or Word, max 5 MB)
        <span className="upload-box"><Icon name="upload" size={20} /><span>{file || 'Choose a file'}</span></span>
        <input id={id('resume')} name="resume" type="file" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0]?.name ?? '')} />
      </label>
      <F label="Message" icon="chat" full htmlFor={id('message')}><textarea id={id('message')} name="message" placeholder="Tell us briefly about yourself" /></F>
      <Honeypot />
      <button type="submit" className="btn btn-orange full" disabled={state === 'sending'} style={{ padding: 16 }}>
        {state === 'sending' ? 'Uploading…' : <><Icon name="send" size={18} />Submit Application</>}
      </button>
    </form>
  );
}

/* ---------- Enroll Now: choose course → details → Thank-you page with Pay Now ---------- */
export type EnrollCourse = {
  id: number; slug: string; title: string; level: string; program: string; programSlug: string;
  online: number | null; offline: number | null; duration: string;
};

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

export function EnrollForm({ courses, defaultSlug, defaultProgram, branches, kidsLabel }: { courses: EnrollCourse[]; defaultSlug?: string; defaultProgram?: string; branches: string[]; kidsLabel: string }) {
  const programs = [...new Map(courses.map((c) => [c.programSlug, c.program])).entries()];
  const initial = courses.find((c) => c.slug === defaultSlug);
  const [prog, setProg] = useState(initial?.programSlug ?? (programs.some(([sl]) => sl === defaultProgram) ? defaultProgram! : ''));
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const levels = courses.filter((c) => c.programSlug === prog);
  const course = courses.find((c) => c.slug === slug && c.programSlug === prog) ?? null;
  const differs = !!course && !!course.online && !!course.offline && course.online !== course.offline;
  const [mode, setMode] = useState<'Online' | 'Offline'>('Online');
  const [country, setCountry] = useState('India');
  const fee = course ? (mode === 'Offline' ? course.offline ?? course.online : course.online ?? course.offline) : null;
  const { state, error, submit } = useSubmit('/api/enquiry', 'enquiry', 'Enroll page');
  const id = (n: string) => `enroll-${n}`;

  return (
    <form className="card enquiry-form lead-full enroll-form" onSubmit={(e) => submit(e)}>
      <Msg state={state} error={error} success="Thank you! Our team will contact you shortly." />
      <input type="hidden" name="courseType" value="Enrolment" />
      <input type="hidden" name="course" value={course?.title ?? ''} />
      <input type="hidden" name="language" value={course ? (course.program.toLowerCase().includes('kids') ? kidsLabel : course.program) : ''} />
      <input type="hidden" name="level" value={course?.level ?? ''} />
      <input type="hidden" name="mode" value={mode} />

      <div className="full enroll-step"><span>1</span>Choose your course</div>
      <F label="Program" icon="languages" htmlFor={id('program')}>
        <select id={id('program')} value={prog} required onChange={(e) => { setProg(e.target.value); setSlug(''); }}>
          <option value="">Select program</option>
          {programs.map(([s, n]) => <option key={s} value={s}>{n}</option>)}
        </select>
      </F>
      <F label="Level" icon="layers" htmlFor={id('level')}>
        <select id={id('level')} value={slug} required disabled={!prog} onChange={(e) => setSlug(e.target.value)}>
          <option value="">{prog ? 'Select level' : 'Choose a program first'}</option>
          {levels.map((c) => <option key={c.slug} value={c.slug}>{c.level || c.title}{c.duration ? ` · ${c.duration}` : ''}</option>)}
        </select>
      </F>
      <div className="full pay-modes" role="radiogroup" aria-label="Class mode">
        {(['Online', 'Offline'] as const).map((m) => {
          const price = course ? (m === 'Online' ? course.online : course.offline) : null;
          return (
            <button key={m} type="button" role="radio" aria-checked={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
              <Icon name={m === 'Online' ? 'laptop' : 'building'} size={16} />{m} class{price && (differs || m === 'Online') ? <strong>{rupee(price)}</strong> : null}
            </button>
          );
        })}
      </div>
      {mode === 'Offline' && branches.length > 0 && (
        <F label="Centre" icon="pin" full htmlFor={id('branch')}><Sel id={id('branch')} name="branch" options={branches} /></F>
      )}

      <div className="full enroll-step"><span>2</span>Your details</div>
      <F label="Full name" icon="user" htmlFor={id('name')}><input id={id('name')} name="name" required autoComplete="name" placeholder="Student name" /></F>
      <F label="Country" icon="globe" htmlFor={id('country')}><Sel id={id('country')} name="country" options={countries.map(([c]) => c)} value={country} onChange={setCountry} /></F>
      <PhoneField id={id('phone')} country={country} />
      <F label="Email" icon="mail" htmlFor={id('email')}><input id={id('email')} name="email" type="email" required autoComplete="email" placeholder="For your receipt" /></F>
      <Honeypot />

      {course && (
        <div className="full pay-total"><span>{course.title} · {mode}</span><strong>{fee ? rupee(fee) : 'Fee on enquiry'}</strong></div>
      )}
      <button type="submit" className="btn btn-orange btn-lg full" disabled={state === 'sending' || !course} data-cta="enroll_submit">
        {state === 'sending' ? 'Please wait…' : <><Icon name="cap" size={19} />{fee ? 'Continue to Payment' : 'Enroll Now'}</>}
      </button>
      <p className="form-note full"><Icon name="shield" size={14} />Next step: review your course and pay securely with Razorpay.</p>
    </form>
  );
}
