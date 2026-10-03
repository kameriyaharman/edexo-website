import Link from 'next/link';
import { Icon, IconBubble, iconFor } from '@/components/Icon';
import { getSettings, s, lines, imageId } from '@/lib/settings';
import {
  getBranches, getCourses, getFeatures, getLanguages, getLevels, getPosts, getReasons, getStats, getTestimonials,
} from '@/lib/data';
import { mediaUrl } from '@/lib/format';
import { CourseTabs } from './CourseTabs';
import { EnquiryForm } from './EnquiryForm';
import { TestimonialSlider } from './TestimonialSlider';
import { BranchCard, PostCard } from './Blocks';

export async function Hero() {
  const st = await getSettings();
  const img = mediaUrl(imageId(st, 'heroImageId'));
  const left = lines(st, 'heroBadgesLeft');
  const right = lines(st, 'heroBadgesRight');
  return (
    <section className="hero">
      <div className="hero-deco" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /><span className="dots" /></div>
      <div className="wrap">
        <div className="hero-copy">
          {s(st, 'heroEyebrow') && <div className="pill"><Icon name="languages" size={16} />{s(st, 'heroEyebrow')}</div>}
          <h1>{s(st, 'heroTitle')} {s(st, 'heroHighlight') && <span className="hl">{s(st, 'heroHighlight')}</span>}</h1>
          <p>{s(st, 'heroText')}</p>
          <div className="hero-ctas">
            {s(st, 'heroPrimaryLabel') && <Link className="btn btn-orange btn-lg" href={s(st, 'heroPrimaryHref', '/#enroll')}><Icon name="video" size={19} />{s(st, 'heroPrimaryLabel')}</Link>}
            {s(st, 'heroSecondaryLabel') && (
              <Link className="play-link" href={s(st, 'heroSecondaryHref', '/courses')}>
                <span><Icon name="arrowRight" size={18} stroke={2.4} /></span>{s(st, 'heroSecondaryLabel')}
              </Link>
            )}
          </div>
        </div>
        <div className="hero-visual" aria-hidden={!img}>
          <div className="circle" />
          {img && <img className="photo" src={img} alt={`${s(st, 'siteName', 'Edexo')} German language student`} fetchPriority="high" />}
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

export async function CoursesSection({ initial }: { initial?: string }) {
  const [st, langs, courses] = await Promise.all([getSettings(), getLanguages(), getCourses()]);
  return (
    <section className="section" id="courses" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="split-head">
          <div>
            <span className="eyebrow"><Icon name="sparkles" size={15} />{s(st, 'coursesEyebrow')}</span>
            <h2 className="h2">{s(st, 'coursesTitle')}</h2>
          </div>
          <p>{s(st, 'coursesText')}</p>
        </div>
        <CourseTabs initial={initial} languages={langs.map((l) => ({ slug: l.slug, name: l.name }))} courses={courses} />
      </div>
    </section>
  );
}

export async function AboutSection() {
  const [st, reasons] = await Promise.all([getSettings(), getReasons()]);
  const img = mediaUrl(imageId(st, 'aboutImageId'));
  return (
    <section className="section bg-peach about">
      <div className="wrap">
        <div className="about-visual">
          <div className="ring" />
          {img && <img src={img} alt={`German class at ${s(st, 'siteName', 'Edexo')}`} loading="lazy" />}
          {s(st, 'aboutBadgeValue') && (
            <div className="card about-badge"><span className="about-badge-ic"><Icon name="medal" size={22} /></span><strong data-count>{s(st, 'aboutBadgeValue')}</strong><span>{s(st, 'aboutBadgeLabel')}</span></div>
          )}
        </div>
        <div className="about-copy">
          <span className="eyebrow"><Icon name="sparkles" size={15} />{s(st, 'aboutEyebrow')}</span>
          <h2 className="h2">{s(st, 'aboutTitle')}</h2>
          <p>{s(st, 'aboutText')}</p>
          <div className="reasons">
            {reasons.map((r) => (
              <div className="card reason" key={r.id}>
                <IconBubble icon={r.icon} tone={r.tone} size={40} iconSize={18} />
                <div><h3>{r.title}</h3><p>{r.description}</p></div>
              </div>
            ))}
          </div>
        </div>
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

export async function EnquiryBand({ defaultCourse }: { defaultCourse?: string }) {
  const [st, courses, branches] = await Promise.all([getSettings(), getCourses(), getBranches()]);
  return (
    <section className="enquiry" id="enroll">
      <div className="wrap">
        <div className="enquiry-copy">
          <h2 className="h2">{s(st, 'enquiryTitle')}</h2>
          <p>{s(st, 'enquiryText')}</p>
          <ul className="ticks">
            {lines(st, 'enquiryPoints').map((p) => <li key={p}><span className="tick-ic"><Icon name={iconFor(p)} size={18} /></span>{p}</li>)}
          </ul>
        </div>
        <EnquiryForm
          source="Free demo form"
          courses={courses.map((c) => c.title)}
          branches={branches.map((b) => b.name)}
          defaultCourse={defaultCourse}
          button={s(st, 'enquiryButton', 'Book My Free Demo')}
          success={s(st, 'enquirySuccess', 'Thank you! We will call you shortly.')}
        />
      </div>
    </section>
  );
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
