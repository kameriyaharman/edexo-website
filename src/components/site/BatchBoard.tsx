'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { LeadForm } from './LeadForms';
import type { BatchView } from '@/lib/batches';

type Props = {
  batches: BatchView[];
  languages: string[];
  branches: string[];
  whatsapp: string;
  source: string;
  kidsLabel: string;
  /** hide the filters (course / program pages) */
  compact?: boolean;
  emptyText?: string;
};

function waLink(number: string, text: string) {
  const n = number.replace(/\D/g, '');
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : '';
}

function startsIn(d: number) {
  if (d < 0) return `Started ${-d} ${d === -1 ? 'day' : 'days'} ago — still open`;
  if (d === 0) return 'Starts today';
  if (d === 1) return 'Starts tomorrow';
  if (d <= 7) return `Starts in ${d} days`;
  return '';
}

function Seats({ b }: { b: BatchView }) {
  if (b.seats === null) return <span className="bt-seats">Open</span>;
  if (b.status === 'full') return <span className="bt-seats full">Batch full</span>;
  const pct = b.totalSeats && b.totalSeats > 0 ? Math.min(100, Math.max(6, Math.round(((b.totalSeats - b.seats) / b.totalSeats) * 100))) : null;
  return (
    <span className={`bt-seats${b.status === 'low' ? ' low' : ''}`}>
      {b.status === 'low' ? `Only ${b.seats} left` : `${b.seats}${b.totalSeats ? ` of ${b.totalSeats}` : ''} seats`}
      {pct !== null && <span className="bt-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>}
    </span>
  );
}

export function BatchBoard({ batches, languages, branches, whatsapp, source, kidsLabel, compact, emptyText }: Props) {
  const programs = useMemo(() => [...new Set(batches.map((b) => b.program).filter(Boolean) as string[])], [batches]);
  const modes = useMemo(() => [...new Set(batches.map((b) => (b.mode === 'Online & Offline' ? ['Online', 'Offline'] : [b.mode])).flat())], [batches]);
  const [lang, setLang] = useState('');
  const [mode, setMode] = useState('');
  const [chosen, setChosen] = useState<{ b: BatchView; kind: 'demo' | 'enquiry' } | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (chosen && !d.open) d.showModal();
    if (!chosen && d.open) d.close();
  }, [chosen]);

  const list = batches.filter((b) => (!lang || b.program === lang) && (!mode || b.mode === mode || b.mode === 'Online & Offline'));

  if (!batches.length) {
    return (
      <div className="card bt-empty">
        <span className="bt-empty-ic"><Icon name="calendar" size={26} /></span>
        <p>{emptyText || 'New batches are being scheduled. Book a free demo and we will share the next start date on WhatsApp.'}</p>
        <Link className="btn btn-orange" href="#enquiry" data-cta="batches_empty_demo"><Icon name="video" size={18} />Book Free Demo</Link>
      </div>
    );
  }

  const b = chosen?.b;
  const isKids = (x: BatchView) => /kids|junior/i.test(`${x.program ?? ''} ${x.course}`);
  return (
    <>
      {!compact && (programs.length > 1 || modes.length > 1) && (
        <div className="bt-filters" role="group" aria-label="Filter batches">
          {programs.length > 1 && (
            <div className="bt-chips">
              <button type="button" aria-pressed={!lang} onClick={() => setLang('')}>All courses</button>
              {programs.map((p) => <button key={p} type="button" aria-pressed={lang === p} onClick={() => setLang(p)}>{p}</button>)}
            </div>
          )}
          {modes.length > 1 && (
            <div className="bt-seg">
              {['', ...modes].map((m) => <button key={m || 'all'} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{m || 'Online & offline'}</button>)}
            </div>
          )}
        </div>
      )}

      <div className="bt-table" role="table" aria-label="Upcoming batches">
        <div className="bt-row bt-head" role="row">
          <span role="columnheader">Course &amp; level</span>
          <span role="columnheader">Batch starts</span>
          <span role="columnheader">Days &amp; timing</span>
          <span role="columnheader">Duration</span>
          <span role="columnheader">Mode &amp; location</span>
          <span role="columnheader">Seats</span>
          <span role="columnheader"><span className="sr-only">Book</span></span>
        </div>
        {list.map((x) => {
          const soon = startsIn(x.inDays);
          const wa = waLink(whatsapp, `Hi Edexo, I'd like details of this batch: ${x.summary}.`);
          return (
            <div className={`bt-row${x.status === 'full' ? ' is-full' : ''}`} role="row" key={x.id}>
              <div className="bt-course" role="cell">
                <span className="bt-date" aria-hidden="true"><b>{x.start.day}</b>{x.start.month}</span>
                <div>
                  <h3>{x.courseSlug ? <Link href={`/${x.courseSlug}`}>{x.course}</Link> : x.course}</h3>
                  <div className="bt-tags">
                    {x.level && <span className="bt-level">{x.level}</span>}
                    {x.badge && <span className="bt-badge">{x.badge}</span>}
                  </div>
                  {x.note && <p className="bt-note">{x.note}</p>}
                </div>
              </div>
              <div role="cell" className="bt-cell"><small>Batch starts</small><strong><time dateTime={x.start.iso}>{x.start.full}</time></strong>{soon && <em className={x.inDays <= 3 ? 'hot' : undefined}>{soon}</em>}</div>
              <div role="cell" className="bt-cell"><small>Days &amp; timing</small><strong>{x.days || 'Shared on enquiry'}</strong>{x.timing && <span className="bt-sub"><Icon name="clock" size={14} />{x.timing}</span>}</div>
              <div role="cell" className="bt-cell"><small>Duration</small><strong>{x.duration || '—'}</strong></div>
              <div role="cell" className="bt-cell"><small>Mode &amp; location</small><strong className="bt-mode"><Icon name={x.mode === 'Offline' ? 'building' : 'laptop'} size={15} />{x.mode}</strong><span className="bt-sub"><Icon name="pin" size={14} />{x.location}</span></div>
              <div role="cell" className="bt-cell"><small>Available seats</small><Seats b={x} /></div>
              <div role="cell" className="bt-actions">
                <button type="button" className="btn btn-orange btn-sm" data-cta="batch_demo" onClick={() => setChosen({ b: x, kind: 'demo' })}>
                  <Icon name="video" size={16} />{x.status === 'full' ? 'Join Waitlist' : 'Book Free Demo'}
                </button>
                {wa
                  ? <a className="btn btn-ghost-navy btn-sm" href={wa} target="_blank" rel="noopener noreferrer" data-cta="batch_enquire"><Icon name="whatsapp" size={16} />Enquire Now</a>
                  : <button type="button" className="btn btn-ghost-navy btn-sm" data-cta="batch_enquire" onClick={() => setChosen({ b: x, kind: 'enquiry' })}><Icon name="chat" size={16} />Enquire Now</button>}
              </div>
            </div>
          );
        })}
        {!list.length && <p className="bt-none">No batch matches this filter. <button type="button" onClick={() => { setLang(''); setMode(''); }}>Show all batches</button></p>}
      </div>

      <dialog ref={dlg} className="bt-dialog" onClose={() => setChosen(null)} onClick={(e) => { if (e.target === dlg.current) setChosen(null); }} aria-labelledby="bt-dialog-title">
        {b && (
          <div className="bt-dialog-in">
            <button type="button" className="bt-close" onClick={() => setChosen(null)} aria-label="Close"><Icon name="close" size={20} /></button>
            <p className="bt-dialog-eyebrow">{b.status === 'full' ? 'Join the waitlist' : chosen?.kind === 'enquiry' ? 'Enquire about this batch' : 'Book a free demo class'}</p>
            <h2 id="bt-dialog-title">{b.course}</h2>
            <ul className="bt-dialog-facts">
              <li><Icon name="calendar" size={15} />{b.start.full}</li>
              {(b.days || b.timing) && <li><Icon name="clock" size={15} />{[b.days, b.timing].filter(Boolean).join(' · ')}</li>}
              <li><Icon name={b.mode === 'Offline' ? 'building' : 'laptop'} size={15} />{b.mode} · {b.location}</li>
            </ul>
            <LeadForm
              key={`${b.id}-${chosen?.kind}`}
              className="enquiry-form bt-form"
              variant="compact"
              type={chosen?.kind === 'enquiry' ? 'enquiry' : 'demo'}
              source={source}
              languages={languages}
              branches={branches}
              defaultCourse={b.courseTitle || b.course}
              defaultLanguage={isKids(b) ? kidsLabel : (b.program ?? undefined)}
              defaultMode={b.mode === 'Online & Offline' ? '' : b.mode}
              defaultBranch={b.centre ?? undefined}
              defaultTiming={b.timing || undefined}
              hiddenFields={{ batch: b.summary + (b.status === 'full' ? ' (waitlist)' : '') }}
              button={b.status === 'full' ? 'Join Waitlist' : chosen?.kind === 'enquiry' ? 'Send Enquiry' : 'Book Free Demo'}
            />
          </div>
        )}
      </dialog>
    </>
  );
}
