import Link from 'next/link';
import { Icon, IconBubble, iconFor } from '@/components/Icon';
import { getSettings, s } from '@/lib/settings';
import { fromPrice, type Program } from '@/lib/data';
import { inr, mediaUrl, splitLines, waHref } from '@/lib/format';
import { JsonLd } from './StructuredData';

/* ---------- FAQs (accordion + FAQPage schema) ---------- */
export function FaqList({ items, schema = true }: { items: { q: string; a: string }[]; schema?: boolean }) {
  if (!items.length) return null;
  return (
    <div className="faq-list">
      {schema && (
        <JsonLd data={{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }} />
      )}
      {items.map((f, i) => (
        <details className="faq" key={f.q} open={i === 0}>
          <summary><span className="faq-ic"><Icon name="help" size={18} /></span>{f.q}<span className="faq-toggle"><Icon name="plus" size={18} /></span></summary>
          <div className="faq-a">{f.a.split('\n').map((p, j) => <p key={j}>{p}</p>)}</div>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({ items, title = 'Frequently Asked Questions', eyebrow = 'FAQs', id = 'faqs', tint }: {
  items: { q: string; a: string }[]; title?: string; eyebrow?: string; id?: string; tint?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className={`section${tint ? ' bg-peach' : ''}`} id={id}>
      <div className="wrap faq-wrap">
        <div className="section-head"><span className="eyebrow"><Icon name="help" size={15} />{eyebrow}</span><h2 className="h2">{title}</h2></div>
        <FaqList items={items} />
      </div>
    </section>
  );
}

/* ---------- CTA band: Book Free Demo | WhatsApp | Enquire ---------- */
export async function CtaBand({ title, text, waText, demoHref = '#enquiry', secondary }: {
  title?: string | null; text?: string | null; waText?: string; demoHref?: string; secondary?: { label: string; href: string };
}) {
  const st = await getSettings();
  const wa = waHref(s(st, 'whatsapp'), waText ?? 'Hi Edexo, I would like to know more about your courses.');
  return (
    <section className="cta-band">
      <div className="wrap">
        <div>
          <h2>{title || s(st, 'enquiryTitle', 'Ready to Start Your Language Journey?')}</h2>
          <p>{text || s(st, 'enquiryText')}</p>
        </div>
        <div className="cta-actions">
          <Link className="btn btn-orange" href={demoHref} data-cta="cta_demo"><Icon name="video" size={18} />Book Free Demo</Link>
          {wa && <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} />WhatsApp Us</a>}
          {secondary && <Link className="btn btn-ghost-light" href={secondary.href} data-cta="cta_secondary">{secondary.label}<Icon name="arrowRight" size={16} /></Link>}
        </div>
      </div>
    </section>
  );
}

export function Disclaimer({ text }: { text?: string | null }) {
  if (!text) return null;
  return <p className="disclaimer"><Icon name="info" size={18} /><span>{text}</span></p>;
}

export function HighlightGrid({ title, items, cols }: { title?: string | null; items: string[]; cols?: number }) {
  if (!items.length) return null;
  const tones = ['orange', 'navy', 'green', 'blue', 'amber'];
  return (
    <div className="hl-block">
      {title && <h2 className="h3">{title}</h2>}
      <div className="hl-grid" style={cols ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` } : undefined}>
        {items.map((h, i) => {
          const [head, ...rest] = h.split(' — ');
          return (
            <div className="card hl-item" key={h}>
              <IconBubble icon={iconFor(h)} tone={tones[i % tones.length]} size={44} iconSize={20} />
              <div><strong>{head}</strong>{rest.length > 0 && <span>{rest.join(' — ')}</span>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- programs ---------- */
export function ProgramCard({ p, blurb }: { p: Program; blurb?: string }) {
  const price = fromPrice(p);
  const img = mediaUrl(p.imageId);
  const levels = p.courses.map((c) => c.level).filter(Boolean);
  return (
    <Link href={`/${p.slug}`} className="card program-card">
      <div className="program-media">
        {img ? <img src={img} alt={`${p.name} classes at Edexo`} loading="lazy" /> : <div className="noimg" />}
        <span className="lang-badge">{p.code}</span>
      </div>
      <div className="program-body">
        <h3>{p.homeTitle || p.name}</h3>
        <p>{blurb ?? (p.homeBlurb || p.intro)}</p>
        {levels.length > 1 && <div className="level-chips">{levels.slice(0, 6).map((l) => <span key={l}>{l}</span>)}</div>}
        <div className="program-foot">
          {price ? <span className="from">From <strong>{inr(price)}</strong></span> : <span className="from">Fees on enquiry</span>}
          <span className="link-arrow">View program<Icon name="arrowRight" size={15} /></span>
        </div>
      </div>
    </Link>
  );
}

/** Level | Online | Offline | Duration table for one program. */
export function FeeTable({ p, link = true }: { p: Program; link?: boolean }) {
  if (!p.courses.length) return null;
  const same = p.courses.every((c) => c.price === c.priceOffline);
  const hasAny = p.courses.some((c) => c.price || c.priceOffline);
  const cell = (n: number | null) => (n ? inr(n) : <span className="muted">On enquiry</span>);
  return (
    <div className="fee-table-wrap">
      <table className="fee-table">
        <thead>
          <tr>
            <th scope="col">{p.levelLabel || 'Level'}</th>
            {hasAny && (same ? <th scope="col">Fee (Online &amp; Offline)</th> : <><th scope="col">Online</th><th scope="col">Offline</th></>)}
            <th scope="col">Duration</th>
            {link && <th scope="col"><span className="sr-only">Details</span></th>}
          </tr>
        </thead>
        <tbody>
          {p.courses.map((c) => (
            <tr key={c.id}>
              <th scope="row">{link ? <Link href={`/${c.slug}`}>{c.level || c.title}</Link> : c.level || c.title}</th>
              {hasAny && (same ? <td data-label="Fee">{cell(c.price)}</td> : <><td data-label="Online">{cell(c.price)}</td><td data-label="Offline">{cell(c.priceOffline)}</td></>)}
              <td data-label="Duration">{c.duration || '—'}</td>
              {link && <td className="fee-go"><Link href={`/${c.slug}`} aria-label={`${c.title} details`}>Details<Icon name="arrowRight" size={14} /></Link></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Ticks({ items, icon = 'checkCircle' }: { items: string[]; icon?: string }) {
  if (!items.length) return null;
  return <ul className="tick-list">{items.map((t) => <li key={t}><Icon name={icon} size={18} />{t}</li>)}</ul>;
}

export const lines = splitLines;
