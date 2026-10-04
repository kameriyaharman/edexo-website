import Link from 'next/link';
import { Icon, IconBubble, iconFor } from '@/components/Icon';
import { getSettings, s } from '@/lib/settings';
import {
  getBranches, getJobs, getLanguages, getPagesByKind, getPrograms, getReasons, parseFaqs, type CourseRow, type Program,
} from '@/lib/data';
import { inr, mediaUrl, splitLines, waHref } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';
import { abs, siteUrl } from '@/lib/seo';
import { PageHero } from './Blocks';
import { EnquiryBand } from './Sections';
import { CtaBand, Disclaimer, FaqList, FaqSection, FeeTable, HighlightGrid, Ticks } from './Platform';
import { CareerForm, FranchiseForm } from './LeadForms';
import { JsonLd } from './StructuredData';

type PageRow = Awaited<ReturnType<typeof getPagesByKind>>[number];

const crumbFor: Record<string, { label: string; href: string }> = {
  exam: { label: 'Exam Preparation', href: '/language-exam-preparation' },
};

/* ---------- landing / service / exam / legal pages ---------- */
export async function LandingPage({ p }: { p: PageRow }) {
  const img = mediaUrl(p.imageId);
  const faqs = parseFaqs(p.faqs);
  const legal = p.kind === 'legal';
  const parent = crumbFor[p.kind];
  const related = p.kind === 'exam' ? (await getPagesByKind('exam')).filter((e) => e.id !== p.id && e.groupName === p.groupName) : [];
  return (
    <>
      <PageHero title={p.title} subtitle={p.subtitle}
        crumbs={[{ label: 'Home', href: '/' }, ...(parent ? [parent] : []), { label: p.title }]} />
      <section className="section">
        <div className={`wrap${legal ? ' narrow' : ''}`}>
          {img && <img className="course-cover" src={img} alt={p.title} />}
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
          <HighlightGrid title={p.highlightsTitle} items={splitLines(p.highlights)} />
          <Disclaimer text={p.disclaimer} />
          {related.length > 0 && (
            <div className="related-chips">
              <strong>Other {p.groupName} exams:</strong>
              {related.map((r) => <Link key={r.id} href={`/${r.slug}`}>{r.title.replace(/ (Exam )?Preparation$/, '')}</Link>)}
            </div>
          )}
        </div>
      </section>
      {p.slug === 'franchise' && <FranchiseBlock />}
      {p.slug === 'careers' && <CareersBlock />}
      {faqs.length > 0 && <FaqSection items={faqs} tint />}
      {!legal && p.showEnquiry && (
        <>
          {p.ctaTitle && <CtaBand title={p.ctaTitle} text={p.ctaText} />}
          <EnquiryBand type={p.slug === 'international-students' ? 'international' : 'demo'}
            defaultExam={p.kind === 'exam' ? examName(p.title) : undefined}
            defaultFormat={p.slug.startsWith('one-to-one') ? 'One-to-One' : p.slug.startsWith('group') ? 'Group' : undefined} />
        </>
      )}
    </>
  );
}

function examName(title: string) {
  const t = title.toLowerCase();
  const map: [RegExp, string][] = [[/goethe/, 'Goethe'], [/telc/, 'TELC'], [/ösd|osd/, 'ÖSD'], [/testdaf/, 'TestDaF'], [/ielts/, 'IELTS'], [/pte/, 'PTE'],
    [/toefl/, 'TOEFL'], [/delf|dalf/, 'DELF / DALF'], [/dele|siele/, 'DELE / SIELE'], [/jlpt/, 'JLPT'], [/hsk/, 'HSK']];
  return map.find(([r]) => r.test(t))?.[1];
}

async function FranchiseBlock() {
  const st = await getSettings();
  return (
    <section className="section bg-peach" id="enquiry">
      <div className="wrap form-split">
        <div>
          <span className="eyebrow"><Icon name="handshake" size={15} />Franchise enquiry</span>
          <h2 className="h2">Partner with {s(st, 'siteName', 'Edexo')}</h2>
          <p>Share a few details and our team will contact you to discuss the franchise model, requirements and next steps.</p>
          <Ticks items={['Education entrepreneurs', 'Existing coaching institutes', 'Language trainers and education professionals', 'Consultants and business partners']} />
        </div>
        <FranchiseForm />
      </div>
    </section>
  );
}

async function CareersBlock() {
  const [jobs, langs] = await Promise.all([getJobs(), getLanguages()]);
  return (
    <>
      <section className="section bg-peach" id="openings">
        <div className="wrap">
          <div className="section-head"><span className="eyebrow"><Icon name="briefcase" size={15} />Open positions</span><h2 className="h2">Current Openings</h2></div>
          {jobs.length ? (
            <div className="job-list">
              {jobs.map((j) => (
                <details className="card job" key={j.id}>
                  <summary>
                    <IconBubble icon={iconFor(j.title)} tone="navy" size={46} iconSize={20} />
                    <div><h3>{j.title}</h3><span className="job-meta">{[j.department, j.location, j.employmentType].filter(Boolean).join(' · ')}</span></div>
                    <span className="link-arrow">Details<Icon name="chevronDown" size={15} /></span>
                  </summary>
                  {j.description && <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(j.description) }} />}
                  {j.requirements && <><h4>Requirements</h4><Ticks items={splitLines(j.requirements)} /></>}
                  <a className="btn btn-orange btn-sm" href="#apply">Apply for this role<Icon name="arrowRight" size={15} /></a>
                </details>
              ))}
            </div>
          ) : (
            <p className="card empty-note"><Icon name="info" size={20} />There are no open positions right now. You can still send us your CV below and we will contact you when a suitable role opens.</p>
          )}
        </div>
      </section>
      <section className="section" id="apply">
        <div className="wrap form-split">
          <div>
            <span className="eyebrow"><Icon name="send" size={15} />Apply</span>
            <h2 className="h2">Send Your Application</h2>
            <p>Fill in your details and upload your CV (PDF or Word). Your CV is only visible to the Edexo team.</p>
          </div>
          <CareerForm positions={jobs.map((j) => j.title)} languages={[...new Set(langs.filter((l) => l.category !== 'kids').map((l) => l.name))]} />
        </div>
      </section>
    </>
  );
}

/* ---------- program page: /german-language-course ---------- */
export async function ProgramPage({ p }: { p: Program }) {
  const st = await getSettings();
  const img = mediaUrl(p.imageId);
  const faqs = parseFaqs(p.faqs);
  const wa = waHref(s(st, 'whatsapp'), `Hi Edexo, I'm interested in the ${p.name} course.`);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: p.title || p.name,
    itemListElement: p.courses.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/${c.slug}`), name: c.title })),
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero title={p.title || p.name} subtitle={p.tagline || p.intro}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Courses & Fees', href: '/courses' }, { label: p.name }]} />
      <section className="section">
        <div className="wrap program-layout">
          <div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.description || p.intro) }} />
            <HighlightGrid items={splitLines(p.highlights)} cols={2} />
          </div>
          <aside className="card program-aside">
            {img && <img src={img} alt={`${p.name} classes at Edexo`} />}
            <h3>Start learning {p.name}</h3>
            <Ticks items={['Free demo class', 'Online & offline batches', 'Group & one-to-one', `${p.courses.length} ${p.courses.length === 1 ? 'level' : 'levels'}`]} />
            <Link className="btn btn-orange full" href={`/enroll?program=${p.slug}`} data-cta="program_enroll"><Icon name="cap" size={18} />Enroll Now</Link>
            <Link className="btn btn-enroll full" href="#enquiry" data-cta="program_demo"><Icon name="video" size={18} />Book Free Demo</Link>
            {wa && <a className="btn btn-wa full" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} />WhatsApp Us</a>}
          </aside>
        </div>
      </section>
      {p.courses.length > 0 && (
        <section className="section bg-peach" id="fees">
          <div className="wrap">
            <div className="section-head"><span className="eyebrow"><Icon name="wallet" size={15} />Levels &amp; fees</span><h2 className="h2">{p.name} Course Fees</h2>{p.feeNote && <p>{p.feeNote}</p>}</div>
            <FeeTable p={p} />
            <div className="level-grid">
              {p.courses.map((c) => (
                <Link href={`/${c.slug}`} className="card level-card" key={c.id}>
                  <span className="rung-code">{c.level}</span>
                  <h3>{c.title}</h3>
                  <p>{c.shortDesc}</p>
                  <span className="link-arrow">View syllabus &amp; fees<Icon name="arrowRight" size={14} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {p.examPrep && (
        <section className="section">
          <div className="wrap narrow">
            <div className="card exam-box">
              <IconBubble icon="target" tone="amber" size={54} iconSize={24} />
              <div><h2 className="h3">{p.name} Exam Preparation</h2><p>{p.examPrep}</p><Link className="link-arrow" href="/language-exam-preparation">Exam preparation<Icon name="arrowRight" size={15} /></Link></div>
            </div>
          </div>
        </section>
      )}
      {faqs.length > 0 && <FaqSection items={faqs} title={`${p.name} Course FAQs`} tint />}
      <EnquiryBand defaultLanguage={p.category === 'kids' ? 'Kids batch (German / French)' : p.name} title={`Start your ${p.name} journey`} />
    </>
  );
}

/* ---------- course page: /german-a1-course ---------- */
export async function CoursePage({ c, program }: { c: CourseRow; program: Program | null }) {
  const [st, reasons, branches] = await Promise.all([getSettings(), getReasons(), getBranches()]);
  const img = mediaUrl(c.imageId);
  const faqs = parseFaqs(c.faqs);
  const siblings = program?.courses ?? [];
  const idx = siblings.findIndex((x) => x.id === c.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const wa = waHref(s(st, 'whatsapp'), `Hi Edexo, I'm interested in ${c.title}. Please share batch details.`);
  const same = c.price === c.priceOffline;
  const url = abs(`/${c.slug}`);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Course', name: c.title, description: c.shortDesc || c.title, url,
    ...(img ? { image: abs(img) } : {}), inLanguage: 'en-IN', ...(c.level ? { educationalLevel: c.level } : {}),
    provider: { '@type': 'EducationalOrganization', '@id': `${siteUrl()}/#organization`, name: s(st, 'siteName', 'Edexo'), sameAs: siteUrl() + '/' },
    ...(c.price ? { offers: { '@type': 'Offer', price: c.price, priceCurrency: 'INR', category: 'Paid', availability: 'https://schema.org/InStock', url } } : {}),
    hasCourseInstance: [
      { '@type': 'CourseInstance', courseMode: 'Online', ...(c.duration ? { courseWorkload: c.duration } : {}) },
      { '@type': 'CourseInstance', courseMode: 'Onsite', location: branches.map((b) => `${b.name}, New Delhi`).join(' / ') || 'New Delhi', ...(c.duration ? { courseWorkload: c.duration } : {}) },
    ],
  };
  const block = (title: string, icon: string, body: React.ReactNode) => (
    <div className="c-block"><h2 className="h3"><span className="c-ic"><Icon name={icon} size={18} /></span>{title}</h2>{body}</div>
  );
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero title={c.title} subtitle={c.shortDesc}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Courses & Fees', href: '/courses' }, ...(program ? [{ label: program.name, href: `/${program.slug}` }] : []), { label: c.level || c.title }]} />
      <section className="section">
        <div className="wrap course-layout">
          <div className="course-main">
            {img && <img className="course-cover" src={img} alt={`${c.title} course at Edexo`} />}
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(c.description) }} />
            {c.whoShouldJoin && block('Who should join', 'users', <p>{c.whoShouldJoin}</p>)}
            {splitLines(c.outcomes).length > 0 && block('Learning outcomes', 'target', <Ticks items={splitLines(c.outcomes)} />)}
            {c.studyMaterial && block('Study material', 'book', <p>{c.studyMaterial}</p>)}
            {c.examPrep && block('Exam preparation', 'award', <p>{c.examPrep}</p>)}
            {c.eligibility && block('Eligibility', 'checkCircle', <p>{c.eligibility}</p>)}
            {splitLines(c.highlights).length > 0 && block('Benefits', 'sparkles', <Ticks items={splitLines(c.highlights)} />)}
            {reasons.length > 0 && block(`Why learn with ${s(st, 'siteName', 'Edexo')}`, 'medal', (
              <div className="mini-why">{reasons.slice(0, 6).map((r) => <span key={r.id}><Icon name={r.icon} size={16} />{r.title}</span>)}</div>
            ))}
            {faqs.length > 0 && block('FAQs', 'help', <FaqList items={faqs} />)}
            {(prev || next) && (
              <nav className="level-nav" aria-label="Other levels">
                {prev ? <Link href={`/${prev.slug}`}><Icon name="chevronLeft" size={16} />{prev.title}</Link> : <span />}
                {next && <Link href={`/${next.slug}`}>{next.title}<Icon name="chevronRight" size={16} /></Link>}
              </nav>
            )}
          </div>
          <aside className="card course-aside">
            <div className="fee-box">
              {c.price || c.priceOffline ? (
                same ? (
                  <div className="fee-row"><span>Fee (online &amp; offline)</span><strong>{inr(c.price)}</strong></div>
                ) : (
                  <>
                    <div className="fee-row"><span><Icon name="laptop" size={15} />Online</span><strong>{c.price ? inr(c.price) : 'On enquiry'}</strong></div>
                    <div className="fee-row"><span><Icon name="building" size={15} />Offline</span><strong>{c.priceOffline ? inr(c.priceOffline) : 'On enquiry'}</strong></div>
                  </>
                )
              ) : <div className="fee-row"><span>Fee</span><strong>On enquiry</strong></div>}
            </div>
            <ul>
              {c.level && <li><Icon name="layers" size={18} /><span><small>Level</small>{c.level}</span></li>}
              {c.duration && <li><Icon name="clock" size={18} /><span><small>Duration</small>{c.duration}</span></li>}
              <li><Icon name="laptop" size={18} /><span><small>Mode</small>{c.mode || 'Online / Offline'}</span></li>
              {c.format && <li><Icon name="users" size={18} /><span><small>Format</small>{c.format}</span></li>}
              {c.timings && <li><Icon name="calendar" size={18} /><span><small>Timings</small>{c.timings}</span></li>}
            </ul>
            <Link className="btn btn-orange full" href={`/enroll?course=${c.slug}`} data-cta="course_enroll"><Icon name="cap" size={18} />Enroll Now</Link>
            <Link className="btn btn-enroll full" href="#enquiry" data-cta="course_demo"><Icon name="video" size={18} />Book Free Demo</Link>
            {wa && <a className="btn btn-wa full" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} />WhatsApp Us</a>}
            <Link className="aside-link" href="#enquiry" data-cta="course_details"><Icon name="file" size={15} />Get course details</Link>
          </aside>
        </div>
      </section>
      <EnquiryBand defaultCourse={c.title} defaultLanguage={program?.category === 'kids' ? 'Kids batch (German / French)' : c.languageName ?? undefined} title={`Book a free ${c.title} demo`} />
    </>
  );
}

/* ---------- Courses & Fees: /courses ---------- */
export async function FeesPage() {
  const [st, programs] = await Promise.all([getSettings(), getPrograms()]);
  const list = programs.filter((p) => p.courses.length);
  return (
    <>
      <PageHero title={s(st, 'coursesTitle', 'Courses & Fees')} subtitle={s(st, 'coursesText')} crumbs={[{ label: 'Home', href: '/' }, { label: 'Courses & Fees' }]} />
      <nav className="fee-nav" aria-label="Programs">
        <div className="wrap">{list.map((p) => <a key={p.id} href={`#${p.slug}`}>{p.name}</a>)}</div>
      </nav>
      <section className="section">
        <div className="wrap fee-sections">
          {list.map((p) => (
            <div className="card fee-card" id={p.slug} key={p.id}>
              <div className="fee-card-head">
                <div>
                  <h2 className="h3"><span className="lang-badge static">{p.code}</span>{p.title || p.name}</h2>
                  {p.feeNote && <p className="muted">{p.feeNote}</p>}
                </div>
                <div className="cta-actions">
                  <Link className="btn btn-orange btn-sm" href={`/enroll?program=${p.slug}`} data-cta="fees_enroll"><Icon name="cap" size={16} />Enroll Now</Link>
                  <Link className="btn btn-enroll btn-sm" href={`/${p.slug}#enquiry`} data-cta="fees_demo"><Icon name="video" size={16} />Book Free Demo</Link>
                  <Link className="btn btn-navy btn-sm" href={`/${p.slug}`}><Icon name="file" size={16} />Get Course Details</Link>
                </div>
              </div>
              <FeeTable p={p} />
            </div>
          ))}
          <Disclaimer text="Fees and durations may change and are confirmed at the time of enrolment. Online and offline options depend on the program and batch." />
        </div>
      </section>
      <CtaBand secondary={{ label: 'Enquire Now', href: '/contact#enquiry' }} />
    </>
  );
}

