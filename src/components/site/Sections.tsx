import Link from 'next/link';
import { Icon, IconBubble, iconFor } from '@/components/Icon';
import { getSettings, s, lines, imageId } from '@/lib/settings';
import {
  getBranches, getFeatures, getLanguages, getLevels, getPosts, getStats, getTestimonials,
} from '@/lib/data';
import { mediaUrl, waHref } from '@/lib/format';
import { LeadForm } from './LeadForms';
import { TestimonialSlider } from './TestimonialSlider';
import { BranchCard, PostCard } from './Blocks';

export async function Hero() {
  const st = await getSettings();
  const img = mediaUrl(imageId(st, 'heroImageId'));
  const left = lines(st, 'heroBadgesLeft');
  const right = lines(st, 'heroBadgesRight');
  const wa = waHref(s(st, 'whatsapp'), 'Hi Edexo, I would like to know about your language courses.');
  return (
    <section className="hero">
      <div className="hero-deco" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /><span className="dots" /></div>
      <div className="wrap">
        <div className="hero-copy">
          {s(st, 'heroEyebrow') && <div className="pill"><Icon name="languages" size={16} />{s(st, 'heroEyebrow')}</div>}
          <h1>{s(st, 'heroTitle')} {s(st, 'heroHighlight') && <span className="hl">{s(st, 'heroHighlight')}</span>}</h1>
          <p>{s(st, 'heroText')}</p>
          {s(st, 'heroSubtext') && <p className="hero-sub">{s(st, 'heroSubtext')}</p>}
          <div className="hero-ctas">
            {s(st, 'heroPrimaryLabel') && <Link className="btn btn-orange btn-lg" data-cta="hero_demo" href={s(st, 'heroPrimaryHref', '/#enroll')}><Icon name="video" size={19} />{s(st, 'heroPrimaryLabel')}</Link>}
            {s(st, 'heroWhatsappLabel') && wa && <a className="btn btn-wa btn-lg" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={19} />{s(st, 'heroWhatsappLabel')}</a>}
            {s(st, 'heroSecondaryLabel') && (
              <Link className="play-link" href={s(st, 'heroSecondaryHref', '/courses')}>
                <span><Icon name="arrowRight" size={18} stroke={2.4} /></span>{s(st, 'heroSecondaryLabel')}
              </Link>
            )}
          </div>
        </div>
        <div className="hero-visual" aria-hidden={!img}>
          <div className="circle" />
          {img && <img className="photo" src={img} alt={`${s(st, 'siteName', 'Edexo')} language student`} fetchPriority="high" />}
          {left.length > 0 && (
            <div className="float-card c1">{left.map((l) => <div className="row" key={l}><Icon name="check" size={16} stroke={3} color="#1A2E8C" />{l}</div>)}</div>
          )}
          {right.length > 0 && (
            <div className="float-card c2">{right.map((l) => <div className="row" key={l}><Icon name="check" size={16} stroke={3} color="#12A15E" />{l}</div>)}</div>
          )}
          {s(st, 'heroStatValue') && (
            <div className="float-card c3">
              <IconBubble icon="user" tone="blue" size={48} />
              <div><strong data-count>{s(st, 'heroStatValue')}</strong>{s(st, 'heroStatLabel')}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export async function FeaturesStrip() {
  const items = await getFeatures();
  if (!items.length) return null;
  return (
    <section className="section-sm">
      <div className="wrap features">
        {items.map((f) => <div className="feature" key={f.id}><IconBubble icon={f.icon} tone={f.tone} />{f.title}</div>)}
      </div>
    </section>
  );
}

export async function LevelsSection() {
  const [st, levels] = await Promise.all([getSettings(), getLevels()]);
  if (!levels.length) return null;
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow"><Icon name="sparkles" size={15} />{s(st, 'levelsEyebrow')}</span>
          <h2 className="h2">{s(st, 'levelsTitle')}</h2>
          {s(st, 'levelsText') && <p>{s(st, 'levelsText')}</p>}
        </div>
        <div className="levels">
          {levels.map((l, i) => (
            <div className={`card level${l.featured ? ' featured' : ''}`} key={l.id}>
              <span className="level-ic"><Icon name={['book', 'layers', 'rocket', 'trophy', 'award', 'star'][i % 6]} size={26} /></span>
              <div className="code">{l.code}</div>
              <h3>{l.title}</h3>
              <p>{l.description}</p>
              {l.link && <Link className={`btn btn-sm ${l.featured ? 'btn-orange' : 'btn-navy'}`} href={l.link}>{l.buttonLabel || 'View Course'}<Icon name="arrowRight" size={15} /></Link>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function EnquiryBand({ defaultCourse, defaultLanguage, defaultExam, defaultFormat, type, title, text, source }: {
  source?: string;
  defaultCourse?: string; defaultLanguage?: string; defaultExam?: string; defaultFormat?: string; type?: 'enquiry' | 'demo' | 'international';
  title?: string | null; text?: string | null;
}) {
  const [st, langs, branches] = await Promise.all([getSettings(), getLanguages(), getBranches()]);
  return (
    <section className="enquiry" id="enquiry">
      <span id="enroll" aria-hidden="true" />
      <div className="wrap">
        <div className="enquiry-copy">
          <h2 className="h2">{title || s(st, 'enquiryTitle')}</h2>
          <p>{text || s(st, 'enquiryText')}</p>
          <ul className="ticks">
            {lines(st, 'enquiryPoints').map((p) => <li key={p}><span className="tick-ic"><Icon name={iconFor(p)} size={18} /></span>{p}</li>)}
          </ul>
        </div>
        <LeadForm
          variant="compact" type={type ?? 'demo'}
          source={source ?? (defaultCourse ? `Course page: ${defaultCourse}` : 'Free demo form')}
          languages={programLanguages(langs)}
          branches={branches.map((b) => b.name)}
          defaultCourse={defaultCourse} defaultLanguage={defaultLanguage} defaultExam={defaultExam} defaultFormat={defaultFormat}
          button={s(st, 'enquiryButton', 'Book Free Demo')}
          success={s(st, 'enquirySuccess', 'Thank you! We will contact you shortly.')}
        />
      </div>
    </section>
  );
}

/** Names for the "Language interested in" select (kids programs fold into their language). */
export function programLanguages(langs: { name: string; category: string }[]) {
  return [...new Set(langs.filter((l) => l.category !== 'kids').map((l) => l.name))].concat(langs.some((l) => l.category === 'kids') ? ['Kids batch (German / French)'] : []);
}

export async function TestimonialsSection({ showTestimonials = true, showStats = true }: { showTestimonials?: boolean; showStats?: boolean }) {
  const [st, all, stats] = await Promise.all([getSettings(), getTestimonials(), getStats()]);
  const items = showTestimonials ? all : [];
  if (!items.length && !(showStats && stats.length)) return null;
  return (
    <section className="section" style={{ paddingBottom: 40 }}>
      <div className="wrap">
        {items.length > 0 && (
          <>
            <div className="section-head" style={{ marginBottom: 48 }}>
              <span className="eyebrow"><Icon name="sparkles" size={15} />{s(st, 'testimonialsEyebrow')}</span>
              <h2 className="h2">{s(st, 'testimonialsTitle')}</h2>
            </div>
            <TestimonialSlider items={items.map((t) => ({ id: t.id, name: t.name, role: t.role, quote: t.quote, rating: t.rating, photo: mediaUrl(t.photoId) }))} />
          </>
        )}
        {showStats && stats.length > 0 && (
          <div className="stats">
            {stats.map((x) => (
              <div className="stat" key={x.id}>
                <IconBubble icon={x.icon} tone={x.tone} size={56} />
                <div><strong data-count>{x.value}</strong><span className="l">{x.label}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export async function BlogSection() {
  const [st, posts] = await Promise.all([getSettings(), getPosts(3)]);
  if (!posts.length) return null;
  return (
    <section className="section" style={{ paddingTop: 72 }}>
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 48 }}>
          <span className="eyebrow"><Icon name="sparkles" size={15} />{s(st, 'blogEyebrow')}</span>
          <h2 className="h2">{s(st, 'blogTitle')}</h2>
        </div>
        <div className="post-grid">{posts.map((p) => <PostCard key={p.id} p={p} />)}</div>
        <p className="center" style={{ marginTop: 40 }}><Link className="btn btn-navy" href="/blog"><Icon name="news" size={18} />View all articles<Icon name="arrowRight" size={16} /></Link></p>
      </div>
    </section>
  );
}

export async function BranchesSection() {
  const [st, branches] = await Promise.all([getSettings(), getBranches()]);
  if (!branches.length) return null;
  return (
    <section className="section bg-peach" id="contact" style={{ padding: '80px 0' }}>
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 40 }}><span className="eyebrow"><Icon name="pin" size={15} />Locations</span><h2 className="h2">{s(st, 'branchesTitle')}</h2></div>
        <div className="branch-grid">{branches.map((b) => <BranchCard key={b.id} b={b} />)}</div>
      </div>
    </section>
  );
}
