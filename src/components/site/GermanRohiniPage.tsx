import Link from 'next/link';
import { Icon, IconBubble } from '@/components/Icon';
import { getSettings, s } from '@/lib/settings';
import { getBranches, getLanguages, getLocations, getPagesByKind, getPrograms, getReasons, parseFaqs } from '@/lib/data';
import { batchesFor } from '@/lib/batches';
import { abs, siteUrl } from '@/lib/seo';
import { inr, splitLines, telHref, waHref } from '@/lib/format';
import { BreadcrumbLd, JsonLd } from './StructuredData';
import { FaqList, FeeTable } from './Platform';
import { LeadForm } from './LeadForms';
import { EnquiryBand, programLanguages } from './Sections';
import { BatchesBoard } from './Batches';
import { placeName } from './LocationPage';

/** Dedicated local-SEO landing page: /german-language-course-in-rohini */
export const ROHINI_GERMAN_PATH = '/german-language-course-in-rohini';
export const ROHINI_GERMAN_DEFAULTS = {
  title: 'German Language Course in Rohini, Delhi – A1 to B2 | Edexo',
  description: 'German language classes in Rohini, Delhi at Edexo — German A1, A2, B1 & B2 courses, offline at our Prashant Vihar centre or online. Fees, batches & free demo.',
  h1: 'German Language Course in Rohini, Delhi',
};

const CORE_LEVELS = ['A1', 'A2', 'B1', 'B2'];
const NEAR_CLUSTERS = ['rohini', 'campus', 'outerRohini', 'outerNorth'];

export async function germanRohiniData() {
  const [st, branches, programs] = await Promise.all([getSettings(), getBranches(), getPrograms()]);
  const german = programs.find((p) => p.slug.startsWith('german') && p.category !== 'kids') ?? null;
  const branch = branches.find((b) => /rohini/i.test(b.name)) ?? branches[0] ?? null;
  return { st, branch, german };
}

export async function GermanRohiniPage() {
  const [{ st, branch, german }, langs, branches, reasons, exams, locations] = await Promise.all([
    germanRohiniData(), getLanguages(), getBranches(), getReasons(), getPagesByKind('exam'), getLocations(),
  ]);
  const site = s(st, 'siteName', 'Edexo');
  const levels = (german?.courses ?? []).filter((c) => CORE_LEVELS.includes(c.level ?? ''));
  const advanced = (german?.courses ?? []).filter((c) => !CORE_LEVELS.includes(c.level ?? ''));
  const a1 = levels.find((c) => c.level === 'A1');
  const batches = german ? await batchesFor({ program: german.name }) : [];
  const phone = branch ? splitLines(branch.phones)[0] : s(st, 'primaryPhone');
  const phones = branch ? splitLines(branch.phones) : [s(st, 'primaryPhone')].filter(Boolean);
  const wa = waHref(s(st, 'whatsapp'), 'Hi Edexo, I want to know about German classes at your Rohini centre (fees & upcoming batches).');
  const mapHref = branch ? branch.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Edexo ${branch.address}`)}` : '';
  const shortAddr = branch ? branch.address.split(',').slice(0, 3).join(',') : 'Rohini, Delhi';
  const nearby = locations.filter((l) => NEAR_CLUSTERS.includes(l.cluster ?? '')).slice(0, 18);
  const germanExams = exams.filter((e) => /german|goethe|telc|ösd|osd|testdaf/i.test(`${e.title} ${e.groupName ?? ''}`)).slice(0, 6);
  const sameFee = levels.every((c) => c.price === c.priceOffline);
  const url = abs(ROHINI_GERMAN_PATH);
  const h1 = s(st, 'rohiniH1').trim() || ROHINI_GERMAN_DEFAULTS.h1;
  const intro = s(st, 'rohiniIntro').trim()
    || `Edexo is a German language institute in Rohini, Delhi. Learn German from A1 to B2 — and up to C2 — in classroom batches at our Rohini centre in Prashant Vihar, or in live online classes. Every course covers speaking, listening, reading and writing, with exam preparation and a free demo class before you join.`;

  const faqs = [
    { q: 'Where is your German language institute in Rohini?', a: branch
      ? `Our Edexo ${branch.name} centre is at ${branch.address}.${branch.landmark ? ` ${branch.landmark}.` : ''} You can visit for a free demo class${phone ? ` — call ${phone} to book a time` : ''}.`
      : 'Our centre is in Rohini, New Delhi. Contact us to book a free demo class.' },
    { q: 'What German courses do you offer in Rohini?', a: `We teach every CEFR level — German ${(german?.courses ?? []).map((c) => c.level).filter(Boolean).join(', ') || 'A1 to C2'}. Most learners start with German A1 and continue through A2, B1 and B2. Classes are available offline at our Rohini centre and online.` },
    { q: 'What is the fee for the German A1 course in Rohini?', a: a1?.price
      ? `The German A1 course fee is ${inr(a1.price)}${a1.priceOffline && a1.priceOffline !== a1.price ? ` online and ${inr(a1.priceOffline)} offline` : sameFee ? ' for both online and offline classes' : ''}. The full fee table for A1, A2, B1 and B2 is on this page and on our Courses & Fees page.`
      : 'Please contact us for the current German A1 fee — the full fee table is on our Courses & Fees page.' },
    { q: 'Do you have offline German classes in Rohini?', a: `Yes. Offline (classroom) German batches run at our Edexo ${branch?.name ?? 'Rohini'} centre${branch ? ` (${shortAddr})` : ''}. If you prefer, you can join the same course as a live online class.` },
    { q: 'When does the next German batch start in Rohini?', a: batches.length
      ? `Upcoming German batches are listed on this page with their start date, days, timing and seats. See all dates on our Upcoming Batches page, or WhatsApp us to reserve a seat.`
      : 'New German batches start regularly. WhatsApp or call us for the next start date and timings, or check our Upcoming Batches page.' },
    { q: 'How long does each German level take?', a: levels.some((c) => c.duration && !/as per/i.test(c.duration))
      ? levels.map((c) => `${c.level}: ${c.duration}`).join(' · ') + '. Timings depend on the batch you choose.'
      : 'The duration depends on the batch schedule (weekday or weekend, hours per class). Our team will share the exact schedule of the batch you choose.' },
    { q: 'Which is the best German institute in Rohini?', a: `The best German institute for you is one with trainers you are comfortable with, the right batch timing and clear preparation for your goal. At Edexo you can attend a free demo class at our Rohini centre, meet the trainer and check the course plan before you enrol.` },
    { q: 'Do you prepare students for Goethe and other German exams?', a: 'Yes. Preparation for German exams such as Goethe, TELC, ÖSD and TestDaF is available, with skill practice and mock tests, according to our active batches.' },
    { q: 'Do you serve students from North Delhi near Rohini?', a: `Yes. Learners from Pitampura, Prashant Vihar, Shalimar Bagh, Ashok Vihar, Model Town, North Campus and other parts of North and North-West Delhi join our Rohini centre. Students further away can join live online classes.` },
    ...parseFaqs(s(st, 'rohiniFaqs')),
  ];

  const centreLd = branch ? {
    '@context': 'https://schema.org', '@type': ['LocalBusiness', 'EducationalOrganization'], '@id': `${siteUrl()}/#centre-${branch.id}`,
    name: `${site} ${branch.name} — German Language Institute`, url,
    address: { '@type': 'PostalAddress', streetAddress: branch.address.replace(/,?\s*New Delhi.*$/i, '').trim(), addressLocality: 'New Delhi', addressRegion: 'Delhi', ...(branch.address.match(/\b(\d{6})\b/) ? { postalCode: branch.address.match(/\b(\d{6})\b/)![1] } : {}), addressCountry: 'IN' },
    ...(phone ? { telephone: phone } : {}), ...(branch.mapUrl ? { hasMap: branch.mapUrl } : {}),
    areaServed: ['Rohini', 'North Delhi', 'North West Delhi'].map((n) => ({ '@type': 'Place', name: n })),
    parentOrganization: { '@id': `${siteUrl()}/#organization` },
  } : null;
  const coursesLd = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'German courses in Rohini, Delhi',
    itemListElement: (german?.courses ?? []).map((c, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'Course', name: `${c.title} Course in Rohini`, url: abs(`/${c.slug}`), description: c.shortDesc || `${c.title} German course at ${site} Rohini, Delhi.`,
        provider: { '@type': 'EducationalOrganization', '@id': `${siteUrl()}/#organization`, name: site, sameAs: siteUrl() + '/' },
        ...(c.price ? { offers: { '@type': 'Offer', price: c.price, priceCurrency: 'INR', category: 'Paid', url: abs(`/${c.slug}`) } } : {}),
        hasCourseInstance: [
          { '@type': 'CourseInstance', courseMode: 'Onsite', location: branch ? { '@id': `${siteUrl()}/#centre-${branch.id}` } : 'Rohini, New Delhi' },
          { '@type': 'CourseInstance', courseMode: 'Online' },
        ],
      },
    })),
  };

  return (
    <div className="loc-page">
      {centreLd && <JsonLd data={centreLd} />}
      <JsonLd data={coursesLd} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
      <BreadcrumbLd crumbs={[{ label: 'Home', href: '/' }, { label: 'German Language Course', href: german ? `/${german.slug}` : '/courses' }, { label: 'Rohini, Delhi' }]} />

      <section className="loc-hero">
        <div className="wrap loc-hero-grid">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <span className="crumb"><Icon name="home" size={14} /><Link href="/">Home</Link><Icon name="chevronRight" size={14} /></span>
              {german && <span className="crumb"><Link href={`/${german.slug}`}>German Language Course</Link><Icon name="chevronRight" size={14} /></span>}
              <span className="crumb">Rohini, Delhi</span>
            </nav>
            <span className="pill"><Icon name="pin" size={15} />German Language Institute in Rohini, Delhi</span>
            <h1>{h1.includes('Rohini') ? <>{h1.split('Rohini')[0]}<span className="hl">Rohini{h1.split('Rohini').slice(1).join('Rohini')}</span></> : h1}</h1>
            <p className="loc-lead">{intro}</p>
            <ul className="loc-points">
              {branch && <li><Icon name="building" size={18} />Offline German classes at Edexo {branch.name} — {shortAddr}</li>}
              <li><Icon name="layers" size={18} />German A1, A2, B1 &amp; B2 courses — continue to C1 and C2</li>
              <li><Icon name="laptop" size={18} />Prefer home? Join the same course as a live online class</li>
              <li><Icon name="video" size={18} />Free demo class before you enrol</li>
            </ul>
            <div className="loc-ctas">
              {wa && <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} />WhatsApp Us</a>}
              {phone && <a className="btn btn-enroll" href={telHref(phone)}><Icon name="phone" size={18} />Call {phone}</a>}
            </div>
          </div>
          <div id="loc-enquiry" className="loc-form">
            <h2><Icon name="send" size={20} />Book a free German demo in Rohini</h2>
            <LeadForm variant="compact" type="demo" className="card enquiry-form" source="German course in Rohini page"
              languages={programLanguages(langs)} branches={branches.map((b) => b.name)} button="Book Free Demo"
              defaultLanguage={german?.name ?? 'German'} defaultBranch={branch?.name}
              success={s(st, 'enquirySuccess', 'Thank you! We will contact you shortly.')} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head"><span className="eyebrow"><Icon name="languages" size={15} />German classes in Rohini</span>
            <h2 className="h2">German A1, A2, B1 &amp; B2 Courses in Rohini</h2>
            <p>Start from zero with A1 or join at your current level. Each level builds speaking, listening, reading, writing and grammar, step by step.</p>
          </div>
          <div className="level-grid">
            {levels.map((c) => (
              <div className="card level-card" key={c.id}>
                <span className="rung-code">{c.level}</span>
                <h3><Link href={`/${c.slug}`}>{c.title} Course in Rohini</Link></h3>
                <p>{c.shortDesc}</p>
                <p className="muted" style={{ margin: '6px 0 12px' }}>
                  {c.price ? <><strong>{inr(c.price)}</strong>{c.priceOffline && c.priceOffline !== c.price ? <> online · <strong>{inr(c.priceOffline)}</strong> offline</> : ' · online & offline'}</> : 'Fee on enquiry'}
                  {c.duration && !/as per/i.test(c.duration) ? <> · {c.duration}</> : null}
                </p>
                <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <Link className="link-arrow" href={`/${c.slug}`}>Syllabus &amp; details<Icon name="arrowRight" size={14} /></Link>
                  <Link className="link-arrow" href={`/enroll?course=${c.slug}`} data-cta="rohini_level_enroll">Enroll<Icon name="arrowRight" size={14} /></Link>
                </span>
              </div>
            ))}
          </div>
          {advanced.length > 0 && (
            <div className="more-programs"><span>Advanced levels:</span>{advanced.map((c) => <Link key={c.id} href={`/${c.slug}`}>{c.title}</Link>)}</div>
          )}
        </div>
      </section>

      {german && (
        <section className="section bg-peach" id="fees">
          <div className="wrap">
            <div className="section-head"><span className="eyebrow"><Icon name="wallet" size={15} />Fees</span><h2 className="h2">German Course Fees in Rohini — Online &amp; Offline</h2>{german.feeNote && <p>{german.feeNote}</p>}</div>
            <FeeTable p={german} />
            <p className="center" style={{ marginTop: 24 }}><Link className="btn btn-navy" href="/courses"><Icon name="wallet" size={17} />All Courses &amp; Fees</Link></p>
          </div>
        </section>
      )}

      <section className="section bt-strip" id="batches">
        <div className="wrap">
          <div className="section-head bt-strip-head"><span className="eyebrow"><Icon name="calendar" size={15} />New batches</span><h2 className="h2">Upcoming German Batches in Rohini &amp; Online</h2></div>
          {batches.length > 0
            ? <BatchesBoard batches={batches} compact source="Batches: German Rohini page" />
            : <p className="center">New German batches are being scheduled. {wa ? <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp us</a> : 'Contact us'} for the next start date and timings.</p>}
          <p className="bt-more"><Link className="link-arrow" href="/upcoming-batches">See all upcoming batches<Icon name="arrowRight" size={15} /></Link></p>
        </div>
      </section>

      <section className="section bg-navy-soft">
        <div className="wrap">
          <div className="section-head"><span className="eyebrow"><Icon name="navigation" size={15} />Offline &amp; online</span><h2 className="h2">Offline German Classes in Rohini — or Live Online</h2></div>
          <div className="format-grid">
            {branch && (
              <div className="card format-card">
                <IconBubble icon="building" tone="orange" size={56} iconSize={24} />
                <h3>Classroom batches at Edexo {branch.name}</h3>
                <p>Learn face to face with your trainer and classmates — speaking practice, group activities and regular tests at our Rohini centre.</p>
                <ul className="tick-list">{['Small classroom batches', 'Weekday and weekend options (as per batch)', 'Study material and assessments'].map((t) => <li key={t}><Icon name="checkCircle" size={17} />{t}</li>)}</ul>
                <a className="btn btn-orange" href={mapHref} target="_blank" rel="noopener noreferrer"><Icon name="navigation" size={17} />Get directions</a>
              </div>
            )}
            <div className="card format-card">
              <IconBubble icon="laptop" tone="navy" size={56} iconSize={24} />
              <h3>Live online German classes</h3>
              <p>Same trainers and course plan as our classroom batches, from home — ideal if you live further from Rohini or have a busy schedule.</p>
              <ul className="tick-list">{['Group and one-to-one options', 'Interactive live sessions', 'Switch between online and offline on request'].map((t) => <li key={t}><Icon name="checkCircle" size={17} />{t}</li>)}</ul>
              <Link className="btn btn-navy" href="/german-online-classes">German online classes<Icon name="arrowRight" size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      {branch && (
        <section className="section" id="visit">
          <div className="wrap loc-about">
            <div>
              <span className="eyebrow"><Icon name="pin" size={15} />Visit us</span>
              <h2 className="h2">Our German Language Centre in Rohini</h2>
              <address className="card" style={{ fontStyle: 'normal', padding: 22, marginTop: 14 }}>
                <p style={{ margin: '0 0 10px' }}><strong>{site} {branch.name}</strong><br />{branch.address}</p>
                {branch.landmark && <p className="muted" style={{ margin: '0 0 10px' }}><Icon name="navigation" size={15} /> {branch.landmark}</p>}
                {phones.length > 0 && <p style={{ margin: '0 0 10px' }}><Icon name="phone" size={15} /> {phones.map((p, i) => <span key={p}>{i > 0 && ' · '}<a href={telHref(p)}>{p}</a></span>)}</p>}
                {s(st, 'email') && <p style={{ margin: '0 0 10px' }}><Icon name="mail" size={15} /> <a href={`mailto:${s(st, 'email')}`}>{s(st, 'email')}</a></p>}
                {branch.hours && <p className="muted" style={{ margin: 0, whiteSpace: 'pre-line' }}><Icon name="clock" size={15} /> {branch.hours}</p>}
              </address>
              <div className="loc-ctas" style={{ marginTop: 16 }}>
                <a className="btn btn-orange" href={mapHref} target="_blank" rel="noopener noreferrer"><Icon name="navigation" size={17} />Open in Google Maps</a>
                {wa && <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={17} />WhatsApp</a>}
              </div>
            </div>
            <div className="card loc-who">
              <h3><Icon name="users" size={20} />Who joins our German classes</h3>
              <ul className="tick-list">{[
                'School and college students starting German (A1)',
                'Students planning to study in Germany',
                'Ausbildung and job seekers who need B1/B2',
                'Professionals learning German for work',
                'Learners preparing for Goethe, TELC or ÖSD exams',
              ].map((a) => <li key={a}><Icon name="checkCircle" size={17} />{a}</li>)}</ul>
            </div>
          </div>
        </section>
      )}

      {reasons.length > 0 && (
        <section className="section bg-peach">
          <div className="wrap">
            <div className="section-head"><span className="eyebrow"><Icon name="sparkles" size={15} />Why Edexo</span><h2 className="h2">Why Learn German at Edexo Rohini</h2></div>
            <div className="why-grid">
              {reasons.slice(0, 8).map((r) => (
                <div className="card why-item" key={r.id}><IconBubble icon={r.icon} tone={r.tone} size={46} iconSize={21} /><div><h3>{r.title}</h3>{r.description && <p>{r.description}</p>}</div></div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-sm">
        <div className="wrap center">
          <h2 className="h3" style={{ justifyContent: 'center', marginBottom: 16 }}><Icon name="target" size={22} />German Exam Preparation &amp; Germany Pathways</h2>
          <div className="exam-chips" style={{ justifyContent: 'center' }}>
            {germanExams.map((e) => <Link key={e.id} href={`/${e.slug}`}>{e.title.replace(/ (Exam )?Preparation$/, '')}<Icon name="arrowRight" size={13} /></Link>)}
            <Link href="/study-in-germany">Study in Germany<Icon name="arrowRight" size={13} /></Link>
            <Link href="/ausbildung-in-germany">Ausbildung in Germany<Icon name="arrowRight" size={13} /></Link>
            {german && <Link href={`/${german.slug}`}>German A1–C2 program<Icon name="arrowRight" size={13} /></Link>}
          </div>
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="section-sm bg-navy-soft">
          <div className="wrap center">
            <h2 className="h3" style={{ justifyContent: 'center', marginBottom: 14 }}><Icon name="pin" size={20} />German Language Classes in North Delhi — Areas Near Our Rohini Centre</h2>
            <div className="related-chips" style={{ justifyContent: 'center' }}>
              {nearby.map((x) => <Link key={x.id} href={`/${x.slug}`}>{placeName(x)}</Link>)}
              <Link href="/areas-we-serve">All areas</Link>
            </div>
          </div>
        </section>
      )}

      <section className="section" id="faqs">
        <div className="wrap faq-wrap">
          <div className="section-head"><span className="eyebrow"><Icon name="help" size={15} />FAQs</span><h2 className="h2">German Classes in Rohini — FAQs</h2></div>
          <FaqList items={faqs} schema={false} />
        </div>
      </section>

      <EnquiryBand source="German course in Rohini page (bottom form)" defaultLanguage={german?.name ?? 'German'}
        title="Start German at Edexo Rohini" text="Book a free demo class — offline at our Rohini centre or online." />
    </div>
  );
}
