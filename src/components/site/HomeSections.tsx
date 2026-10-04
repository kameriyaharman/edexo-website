import Link from 'next/link';
import { Icon, IconBubble, iconFor } from '@/components/Icon';
import { getSettings, s, imageId } from '@/lib/settings';
import { getFaqs, getPage, getPagesByKind, getPrograms, getReasons } from '@/lib/data';
import { inr, mediaUrl, splitLines } from '@/lib/format';
import { Disclaimer, FaqSection, ProgramCard } from './Platform';

const Head = ({ eyebrow, title, text, icon = 'sparkles' }: { eyebrow?: string; title: string; text?: string; icon?: string }) => (
  <div className="section-head">
    {eyebrow && <span className="eyebrow"><Icon name={icon} size={15} />{eyebrow}</span>}
    <h2 className="h2">{title}</h2>
    {text && <p>{text}</p>}
  </div>
);

export async function ProgramsSection() {
  const [st, programs] = await Promise.all([getSettings(), getPrograms()]);
  const home = programs.filter((p) => p.showOnHome);
  const list = home.length ? home : programs.slice(0, 6);
  if (!list.length) return null;
  const others = programs.filter((p) => !list.includes(p));
  return (
    <section className="section" id="programs">
      <div className="wrap">
        <Head eyebrow={s(st, 'programsEyebrow', 'Language Programs')} title={s(st, 'programsTitle', 'Popular Language Programs')} text={s(st, 'programsText')} icon="languages" />
        <div className="program-grid">{list.map((p) => <ProgramCard key={p.id} p={p} />)}</div>
        {others.length > 0 && (
          <div className="more-programs">
            <span>Also available:</span>
            {others.map((p) => <Link key={p.id} href={`/${p.slug}`}>{p.name}</Link>)}
            <Link className="btn btn-navy btn-sm" href="/courses"><Icon name="wallet" size={16} />All Courses &amp; Fees</Link>
          </div>
        )}
      </div>
    </section>
  );
}

export async function WhySection() {
  const [st, reasons] = await Promise.all([getSettings(), getReasons()]);
  if (!reasons.length) return null;
  const img = mediaUrl(imageId(st, 'aboutImageId'));
  return (
    <section className="section bg-peach why">
      <div className="wrap">
        <div className="why-top">
          <div>
            <span className="eyebrow"><Icon name="sparkles" size={15} />{s(st, 'aboutEyebrow', 'About Edexo')}</span>
            <h2 className="h2">{s(st, 'aboutTitle', 'Why Choose Edexo?')}</h2>
            <p>{s(st, 'aboutText')}</p>
            <Link className="btn btn-navy" href="/about"><Icon name="info" size={17} />About Edexo<Icon name="arrowRight" size={16} /></Link>
          </div>
          {img && <img className="why-img" src={img} alt={`Live class at ${s(st, 'siteName', 'Edexo')}`} loading="lazy" />}
        </div>
        <div className="why-grid">
          {reasons.map((r) => (
            <div className="card why-item" key={r.id}>
              <IconBubble icon={r.icon} tone={r.tone} size={46} iconSize={21} />
              <div><h3>{r.title}</h3>{r.description && <p>{r.description}</p>}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function GermanSection() {
  const [st, programs] = await Promise.all([getSettings(), getPrograms()]);
  const p = programs.find((x) => x.slug.startsWith('german') && x.category !== 'kids');
  if (!p?.courses.length) return null;
  return (
    <section className="section german">
      <div className="wrap">
        <Head eyebrow={s(st, 'germanEyebrow', 'German A1–C2')} title={s(st, 'germanTitle', 'Learn German from A1 to C2')} text={s(st, 'germanText')} icon="languages" />
        <div className="ladder">
          {p.courses.map((c, i) => (
            <Link href={`/${c.slug}`} className="card rung" key={c.id} style={{ ['--i' as string]: i }}>
              <span className="rung-code">{c.level}</span>
              <span className="rung-name">{c.shortDesc?.split(':')[0]}</span>
              {c.price ? <strong className="rung-price">{inr(c.price)}</strong> : <span className="muted">Fees on enquiry</span>}
              <span className="link-arrow">Details<Icon name="arrowRight" size={14} /></span>
            </Link>
          ))}
        </div>
        <p className="center" style={{ marginTop: 32 }}>
          <Link className="btn btn-orange" href={`/${p.slug}`}><Icon name="cap" size={18} />Explore German Program</Link>
        </p>
      </div>
    </section>
  );
}

export async function ExamsSection() {
  const [st, exams, master] = await Promise.all([getSettings(), getPagesByKind('exam'), getPage('language-exam-preparation')]);
  if (!exams.length) return null;
  const groups = [...new Set(exams.map((e) => e.groupName || 'Other'))];
  return (
    <section className="section bg-navy-soft" id="exams">
      <div className="wrap">
        <Head eyebrow={s(st, 'examsEyebrow', 'Exam Preparation')} title={s(st, 'examsTitle', 'Prepare for International Language Exams')} text={s(st, 'examsText')} icon="target" />
        <div className="exam-groups">
          {groups.map((g) => (
            <div className="card exam-group" key={g}>
              <h3><Icon name="languages" size={18} />{g}</h3>
              <div className="exam-chips">
                {exams.filter((e) => (e.groupName || 'Other') === g).map((e) => (
                  <Link key={e.id} href={`/${e.slug}`}>{e.title.replace(/ (Exam )?Preparation$/, '')}<Icon name="arrowRight" size={13} /></Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        {master && <p className="center" style={{ marginTop: 32 }}><Link className="btn btn-navy" href={`/${master.slug}`}><Icon name="target" size={18} />All Exam Preparation</Link></p>}
      </div>
    </section>
  );
}

export async function OnlineSection() {
  const [st, page] = await Promise.all([getSettings(), getPage('online-language-classes')]);
  if (!page) return null;
  const steps = (page.content ?? '').split('\n').map((l) => l.match(/^\d+\.\s+(.*)$/)?.[1]).filter(Boolean) as string[];
  return (
    <section className="section online" id="online">
      <div className="wrap online-grid">
        <div>
          <span className="eyebrow"><Icon name="laptop" size={15} />{s(st, 'onlineEyebrow', 'Online Classes')}</span>
          <h2 className="h2">{page.title}</h2>
          <p className="lead">{page.subtitle}</p>
          <ul className="tick-list two">{splitLines(page.highlights).map((h) => <li key={h}><Icon name={iconFor(h)} size={18} />{h}</li>)}</ul>
          <Link className="btn btn-orange" href={`/${page.slug}`}><Icon name="video" size={18} />Explore Online Classes</Link>
        </div>
        {steps.length > 0 && (
          <div className="card steps">
            <h3>How it works</h3>
            <ol>{steps.map((t, i) => <li key={t}><span>{i + 1}</span>{t}</li>)}</ol>
          </div>
        )}
      </div>
    </section>
  );
}

export async function ClassesSection() {
  const [st, one, group] = await Promise.all([getSettings(), getPage('one-to-one-language-classes'), getPage('group-language-classes')]);
  const items = [one, group].filter(Boolean) as NonNullable<typeof one>[];
  if (!items.length) return null;
  return (
    <section className="section bg-peach">
      <div className="wrap">
        <Head eyebrow="Learning formats" title={s(st, 'classesTitle', 'One-to-One & Group Classes')} icon="users" />
        <div className="format-grid">
          {items.map((p, i) => (
            <div className="card format-card" key={p.id}>
              <IconBubble icon={i === 0 ? 'user' : 'users'} tone={i === 0 ? 'orange' : 'navy'} size={58} iconSize={26} />
              <h3>{p.title}</h3>
              <p>{p.subtitle}</p>
              <ul className="tick-list">{splitLines(p.highlights).slice(0, 5).map((h) => <li key={h}><Icon name="checkCircle" size={17} />{h}</li>)}</ul>
              <Link className={`btn ${i === 0 ? 'btn-orange' : 'btn-navy'}`} href={`/${p.slug}`}>{p.ctaTitle || 'Learn more'}<Icon name="arrowRight" size={16} /></Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function AbroadSection() {
  const [st, pages] = await Promise.all([getSettings(), Promise.all(['study-in-germany', 'ausbildung-in-germany', 'german-for-work'].map(getPage))]);
  const items = pages.filter(Boolean) as NonNullable<(typeof pages)[number]>[];
  if (!items.length) return null;
  const icons = ['cap', 'briefcase', 'office'];
  return (
    <section className="section abroad" id="abroad">
      <div className="wrap">
        <Head eyebrow={s(st, 'abroadEyebrow', 'Study & Work Abroad')} title={s(st, 'abroadTitle', 'Study & Work in Germany')} text={s(st, 'abroadText')} icon="plane" />
        <div className="abroad-grid">
          {items.map((p, i) => (
            <Link href={`/${p.slug}`} className="card abroad-card" key={p.id}>
              <IconBubble icon={icons[i] ?? 'plane'} tone={['orange', 'navy', 'green'][i % 3]} size={54} iconSize={24} />
              <h3>{p.title}</h3>
              <p>{p.subtitle}</p>
              <span className="link-arrow">Learn more<Icon name="arrowRight" size={15} /></span>
            </Link>
          ))}
        </div>
        <div className="center" style={{ marginTop: 32, display: 'grid', gap: 18, justifyItems: 'center' }}>
          <Link className="btn btn-orange" href="/contact?type=demo#enquiry" data-cta="counsellor"><Icon name="headphones" size={18} />Talk to an Edexo Counsellor</Link>
          <Disclaimer text={s(st, 'abroadDisclaimer')} />
        </div>
      </div>
    </section>
  );
}

export async function InternationalSection() {
  const st = await getSettings();
  return (
    <section className="intl-band">
      <div className="wrap">
        <span className="intl-globe" aria-hidden="true"><Icon name="globe" size={56} stroke={1.5} /></span>
        <div>
          <h2>{s(st, 'intlTitle', 'Are you outside India?')}</h2>
          <p>{s(st, 'intlText')}</p>
        </div>
        <div className="cta-actions">
          <Link className="btn btn-orange" href="/contact?type=international#enquiry" data-cta="international"><Icon name="globe" size={18} />{s(st, 'intlButton', 'International Student Enquiry')}</Link>
          <Link className="btn btn-ghost-light" href="/international-students">Learn more<Icon name="arrowRight" size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

export async function HomeFaqs() {
  const [st, faqs] = await Promise.all([getSettings(), getFaqs()]);
  const items = faqs.filter((f) => f.showOnHome).map((f) => ({ q: f.question, a: f.answer }));
  return <FaqSection items={items} title={s(st, 'faqsTitle', 'Frequently Asked Questions')} eyebrow={s(st, 'faqsEyebrow', 'FAQs')} />;
}

