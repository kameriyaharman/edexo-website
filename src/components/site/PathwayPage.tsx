import Link from 'next/link';
import { Icon, IconBubble, iconFor } from '@/components/Icon';
import { getSettings, s } from '@/lib/settings';
import { mediaUrl, waHref } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';
import { faqItems, lines, normalizeBlocks, splitDash, splitPipe, type Block } from '@/lib/blocks';
import { BreadcrumbLd, JsonLd } from './StructuredData';
import { FaqList } from './Platform';
import { EligibilityForm } from './LeadForms';

type PageRow = { id: number; slug: string; title: string; subtitle: string | null; imageId: number | null; disclaimer: string | null; sections: unknown };

const TONES = ['orange', 'navy', 'green', 'blue', 'amber'];

/** Long landing pages built from admin-editable sections (Ausbildung, Study in Germany…). */
export async function PathwayPage({ p }: { p: PageRow }) {
  const st = await getSettings();
  const blocks = normalizeBlocks(p.sections).filter((b) => !b.hidden);
  const wa = waHref(s(st, 'whatsapp'), `Hi Edexo, I'm interested in ${p.title}.`);
  const href = (link: string) => (link === 'whatsapp' ? wa : link);
  const btns = (b: Block, light = false) => {
    const list = lines(b.buttons).map(splitPipe).filter(([l, h]) => l && h && href(h));
    if (!list.length) return null;
    return (
      <div className="pw-btns">
        {list.map(([label, h], i) => {
          const isWa = h === 'whatsapp';
          const cls = isWa ? 'btn btn-wa' : i === 0 ? 'btn btn-orange' : light ? 'btn btn-ghost-light' : 'btn btn-enroll';
          const icon = isWa ? 'whatsapp' : /counsel/i.test(label) ? 'headphones' : /eligib/i.test(label) ? 'checkCircle' : /package|detail/i.test(label) ? 'file' : 'arrowRight';
          return isWa
            ? <a key={label} className={cls} href={href(h)} target="_blank" rel="noopener noreferrer"><Icon name={icon} size={18} />{label}</a>
            : <Link key={label} className={cls} href={h} data-cta={`${p.slug}_${label.toLowerCase().replace(/\W+/g, '_')}`}><Icon name={icon} size={18} />{label}</Link>;
        })}
      </div>
    );
  };
  const head = (b: Block, center = true) => (b.title || b.eyebrow || b.text) && (
    <div className={center ? 'section-head' : 'pw-head-left'}>
      {b.eyebrow && <span className="eyebrow"><Icon name="sparkles" size={15} />{b.eyebrow}</span>}
      {b.title && <h2 className="h2">{b.title}</h2>}
      {b.text && <div className="pw-intro" dangerouslySetInnerHTML={{ __html: renderMarkdown(b.text) }} />}
    </div>
  );
  const allFaqs = blocks.filter((b) => b.type === 'faq').flatMap((b) => faqItems(b.items));
  const formBlock = blocks.find((b) => b.type === 'form');
  const careerFields = lines(blocks.find((b) => b.type === 'cards' && /field|area/i.test(b.title ?? ''))?.items).map((l) => splitDash(l)[0]);
  const intakes = lines(blocks.find((b) => b.type === 'timeline')?.items).map((l) => splitDash(l)[0]);
  let bg = 0;

  return (
    <div className="pathway">
      <BreadcrumbLd crumbs={[{ label: 'Home', href: '/' }, { label: p.title }]} />
      {allFaqs.length > 0 && (
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: allFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
      )}
      {blocks.map((b) => {
        const tint = b.tint ? ' bg-peach' : '';
        const items = lines(b.items);
        switch (b.type) {
          case 'hero': {
            const img = mediaUrl(p.imageId);
            return (
              <section className="pw-hero" key={b.id}>
                <div className="pw-hero-deco" aria-hidden="true" />
                <div className="wrap pw-hero-grid">
                  <div>
                    <nav className="crumbs light" aria-label="Breadcrumb"><span className="crumb"><Icon name="home" size={14} /><Link href="/">Home</Link><Icon name="chevronRight" size={14} /></span><span className="crumb">{p.title}</span></nav>
                    {b.eyebrow && <span className="pw-pill"><Icon name="flag" size={15} />{b.eyebrow}</span>}
                    <h1>{b.title || p.title}</h1>
                    {b.text && <p className="pw-lead">{b.text}</p>}
                    {btns(b, true)}
                    {items.length > 0 && <ul className="pw-hero-ticks">{items.map((t) => <li key={t}><Icon name="checkCircle" size={17} />{t}</li>)}</ul>}
                  </div>
                  {img ? <img className="pw-hero-img" src={img} alt={p.title} fetchPriority="high" /> : (
                    <div className="pw-hero-card" aria-hidden="true">
                      <span className="pw-flag"><i /><i /><i /></span>
                      <strong>{p.title}</strong>
                      {lines(b.buttons).length > 0 && <span>Free counselling · Online &amp; offline</span>}
                    </div>
                  )}
                </div>
              </section>
            );
          }
          case 'text':
            return (
              <section className={`section pw-sec${tint}`} key={b.id}>
                <div className="wrap narrow pw-text">
                  {b.eyebrow && <span className="eyebrow"><Icon name="sparkles" size={15} />{b.eyebrow}</span>}
                  {b.title && <h2 className="h2">{b.title}</h2>}
                  {b.text && <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(b.text) }} />}
                  {items.length > 0 && <ul className="tick-list two">{items.map((t) => <li key={t}><Icon name="checkCircle" size={18} />{t}</li>)}</ul>}
                </div>
              </section>
            );
          case 'cards':
          case 'ticks':
          case 'chips':
            return (
              <section className={`section pw-sec${tint}`} key={b.id}>
                <div className="wrap">
                  {head(b)}
                  {b.type === 'cards' && (
                    <div className={`pw-cards${items.length <= 4 ? ' few' : ''}`}>
                      {items.map((t, i) => {
                        const [h, d] = splitDash(t);
                        return (
                          <div className="card pw-card" key={t}>
                            <IconBubble icon={iconFor(h)} tone={TONES[i % TONES.length]} size={48} iconSize={22} />
                            <div><h3>{h}</h3>{d && <p>{d}</p>}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {b.type === 'ticks' && <ul className="pw-ticks">{items.map((t) => { const [h, d] = splitDash(t); return <li key={t}><Icon name="checkCircle" size={20} /><span><strong>{h}</strong>{d && <small>{d}</small>}</span></li>; })}</ul>}
                  {b.type === 'chips' && <div className="pw-chips">{items.map((t) => <span key={t}><Icon name={iconFor(t)} size={15} />{t}</span>)}</div>}
                  {btns(b) && <div className="center" style={{ marginTop: 28 }}>{btns(b)}</div>}
                </div>
              </section>
            );
          case 'path':
            return (
              <section className={`section pw-sec${tint}`} key={b.id}>
                <div className="wrap">
                  {head(b)}
                  <div className="pw-path">
                    {items.map((t, i) => (
                      <div className="pw-path-step" key={t} style={{ ['--i' as string]: i }}>
                        <span className="pw-path-dot">{splitDash(t)[0]}</span>
                        {splitDash(t)[1] && <small>{splitDash(t)[1]}</small>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'steps':
            return (
              <section className={`section pw-sec${tint}`} key={b.id}>
                <div className="wrap">
                  {head(b)}
                  <ol className="pw-steps">
                    {items.map((t, i) => {
                      const [h, d] = splitDash(t);
                      return <li key={t}><span className="pw-step-n">{i + 1}</span><div><strong>{h}</strong>{d && <p>{d}</p>}</div></li>;
                    })}
                  </ol>
                </div>
              </section>
            );
          case 'timeline':
            return (
              <section className={`section pw-sec${tint}`} key={b.id}>
                <div className="wrap">
                  {head(b)}
                  <div className="pw-intakes">
                    {items.map((t, i) => {
                      const [h, d] = splitDash(t);
                      return (
                        <div className="card pw-intake" key={t}>
                          <span className="pw-intake-ic"><Icon name="calendar" size={24} /></span>
                          <small>{i === 0 ? 'Next intake' : 'Upcoming'}</small>
                          <h3>{h}</h3>
                          {d && <p>{d}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          case 'split':
            return (
              <section className={`section pw-sec${tint}`} key={b.id}>
                <div className="wrap">
                  {head(b)}
                  <div className={`pw-split cols-${Math.min(3, b.columns?.length ?? 2)}`}>
                    {(b.columns ?? []).map((c, i) => (
                      <div className={`card pw-col${i === 0 ? ' a' : ' b'}`} key={i}>
                        <h3>{c.title}</h3>
                        {c.text && <div className="pw-col-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(c.text) }} />}
                        {lines(c.items).length > 0 && <ul className="tick-list">{lines(c.items).map((t) => <li key={t}><Icon name="checkCircle" size={17} />{t}</li>)}</ul>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'note':
            return (
              <section className={`section-sm pw-sec${tint}`} key={b.id}>
                <div className="wrap narrow">
                  <div className={`pw-note ${b.tone ?? 'info'}`}>
                    <span className="pw-note-ic"><Icon name={b.tone === 'update' ? 'zap' : b.tone === 'warning' ? 'info' : 'lightbulb'} size={22} /></span>
                    <div>
                      {b.eyebrow && <small>{b.eyebrow}</small>}
                      {b.title && <h3>{b.title}</h3>}
                      {b.text && <div dangerouslySetInnerHTML={{ __html: renderMarkdown(b.text) }} />}
                      {items.length > 0 && <ul className="tick-list">{items.map((t) => <li key={t}><Icon name="checkCircle" size={17} />{t}</li>)}</ul>}
                    </div>
                  </div>
                </div>
              </section>
            );
          case 'package':
            return (
              <section className={`section pw-sec${tint}`} key={b.id}>
                <div className="wrap">
                  <div className="pw-package">
                    <div>
                      {b.eyebrow && <span className="pw-pill"><Icon name="gift" size={15} />{b.eyebrow}</span>}
                      <h2>{b.title}</h2>
                      {b.text && <div className="pw-package-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(b.text) }} />}
                      {btns(b, true)}
                    </div>
                    <ul>{items.map((t) => <li key={t}><Icon name="checkCircle" size={18} />{t}</li>)}</ul>
                  </div>
                </div>
              </section>
            );
          case 'form': {
            const n = bg++;
            return (
              <section className={`section pw-sec pw-form-sec${n % 2 ? '' : ' bg-peach'}`} id="eligibility" key={b.id}>
                <span id="counselling" aria-hidden="true" />
                <div className="wrap form-split">
                  <div>
                    {b.eyebrow && <span className="eyebrow"><Icon name="checkCircle" size={15} />{b.eyebrow}</span>}
                    <h2 className="h2">{b.title}</h2>
                    {b.text && <div className="pw-intro left" dangerouslySetInnerHTML={{ __html: renderMarkdown(b.text) }} />}
                    {items.length > 0 && <ul className="tick-list">{items.map((t) => <li key={t}><Icon name="checkCircle" size={18} />{t}</li>)}</ul>}
                    {wa && <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer" style={{ marginTop: 12 }}><Icon name="whatsapp" size={18} />Prefer WhatsApp?</a>}
                  </div>
                  <EligibilityForm kind={b.form ?? 'ausbildung'} success={lines(b.buttons)[0]}
                    fields={{ careerFields, intakes, courses: lines(blocks.find((x) => x.type === 'chips' && /area|course/i.test(x.title ?? ''))?.items) }} />
                </div>
              </section>
            );
          }
          case 'cta':
            return (
              <section className="cta-band pw-cta" key={b.id}>
                <div className="wrap">
                  <div><h2>{b.title}</h2>{b.text && <p>{b.text}</p>}</div>
                  {btns(b, true)}
                </div>
              </section>
            );
          case 'faq': {
            const f = faqItems(b.items);
            if (!f.length) return null;
            return (
              <section className={`section pw-sec${tint}`} key={b.id} id={formBlock ? undefined : 'faqs'}>
                <div className="wrap faq-wrap">
                  {head(b)}
                  <FaqList items={f} schema={false} />
                </div>
              </section>
            );
          }
          case 'links':
            return (
              <section className={`section-sm pw-sec${tint}`} key={b.id}>
                <div className="wrap narrow">
                  {b.title && <h2 className="h3" style={{ marginBottom: 14 }}><Icon name="external" size={20} />{b.title}</h2>}
                  {b.text && <p className="muted" style={{ marginBottom: 12 }}>{b.text}</p>}
                  <div className="pw-links">
                    {items.map(splitPipe).filter(([, u]) => /^https?:\/\//.test(u)).map(([l, u]) => (
                      <a key={u} href={u} target="_blank" rel="noopener noreferrer"><Icon name="globe" size={16} />{l}<Icon name="external" size={14} /></a>
                    ))}
                  </div>
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
      {p.disclaimer && (
        <section className="section-sm">
          <div className="wrap narrow"><p className="disclaimer pw-disclaimer"><Icon name="info" size={18} /><span><strong>Disclaimer: </strong>{p.disclaimer}</span></p></div>
        </section>
      )}
    </div>
  );
}
