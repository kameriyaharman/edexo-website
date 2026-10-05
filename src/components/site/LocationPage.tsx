import Link from 'next/link';
import { Icon, IconBubble } from '@/components/Icon';
import { getSettings, s } from '@/lib/settings';
import { getBranches, getLanguages, getLocations, getPagesByKind, getPrograms, getReasons, parseFaqs } from '@/lib/data';
import { CLUSTERS } from '@/lib/locations';
import { abs, siteUrl } from '@/lib/seo';
import { mediaUrl, splitLines, telHref, waHref } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';
import { BreadcrumbLd, JsonLd } from './StructuredData';
import { FaqList, FeeTable, ProgramCard } from './Platform';
import { LeadForm } from './LeadForms';
import { EnquiryBand, programLanguages } from './Sections';

type Loc = Awaited<ReturnType<typeof getLocations>>[number];

export const placeName = (l: { name: string }) => l.name.replace(/ \(.*\)$/, '');

/** Service-area page: German & foreign language classes for learners in one Delhi-NCR locality. */
export async function LocationPage({ l }: { l: Loc }) {
  const [st, branches, langs, programs, reasons, exams, all] = await Promise.all([
    getSettings(), getBranches(), getLanguages(), getPrograms(), getReasons(), getPagesByKind('exam'), getLocations(),
  ]);
  const place = placeName(l);
  const branch = branches.find((b) => b.id === l.branchId) ?? branches[0];
  const cluster = CLUSTERS[l.cluster ?? ''] ?? CLUSTERS.rohini;
  const atCentre = !!branch && branch.address.toLowerCase().includes(place.toLowerCase());
  const audience = splitLines(l.audience || cluster.audience);
  const popular = programs.filter((p) => p.showOnHome);
  const others = programs.filter((p) => !p.showOnHome);
  const german = programs.find((p) => p.slug.startsWith('german') && p.category !== 'kids');
  const nearby = all.filter((x) => x.id !== l.id && x.cluster === l.cluster).slice(0, 12);
  const phone = branch ? splitLines(branch.phones)[0] : s(st, 'primaryPhone');
  const wa = waHref(s(st, 'whatsapp'), `Hi Edexo, I'm from ${place} and want to know about your language classes.`);
  const mapQ = branch ? encodeURIComponent(`Edexo ${branch.address}`) : '';
  const img = mediaUrl(l.imageId);
  const centreLine = branch
    ? atCentre ? `Our Edexo ${branch.name} centre is right here in ${place}.` : `Our nearest centre for ${place} is Edexo ${branch.name} — ${branch.address.split(',').slice(0, 3).join(',')}.`
    : '';

  const faqs = [
    { q: `Do you have a centre in ${place}?`, a: atCentre
      ? `Yes. Our Edexo ${branch!.name} centre is located at ${branch!.address}. You can visit for a free demo class or join live online classes.`
      : `Our nearest centre for learners in ${place} is Edexo ${branch?.name ?? 'Rohini'}${branch ? ` (${branch.address})` : ''}. You can attend classroom batches there, or join our live online classes from ${place}.` },
    { q: `Which languages can I learn near ${place}?`, a: `German (A1–C2) is our speciality. We also teach French, Spanish, Japanese, Chinese, Korean, Italian, Russian, Arabic, Portuguese and English, plus German and French batches for kids aged 8–16.` },
    { q: `Can I join online classes from ${place}?`, a: `Yes. All our main programs run as live, instructor-led online classes, so you can learn from home in ${place} and choose a group or one-to-one format.` },
    { q: `What are the German course fees for students in ${place}?`, a: `German course fees are the same for online and offline classes — see the German fee table on this page or our Courses & Fees page. A free demo class is available before you enrol.` },
    { q: `Do you offer exam preparation for students in ${place}?`, a: `Yes, preparation for exams such as Goethe, TELC, ÖSD, TestDaF, IELTS, DELF, DELE, JLPT and HSK is available, according to our active batches.` },
    ...parseFaqs(l.faqs),
  ];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Service', name: `Language classes in ${place}`,
    serviceType: 'Foreign language training', url: abs(`/${l.slug}`),
    provider: { '@type': 'EducationalOrganization', '@id': `${siteUrl()}/#organization`, name: s(st, 'siteName', 'Edexo') },
    areaServed: { '@type': 'Place', name: `${place}, ${l.region === 'Haryana' ? 'Haryana' : 'Delhi'}, India` },
    availableChannel: [{ '@type': 'ServiceChannel', name: 'Online classes' }, ...(branch ? [{ '@type': 'ServiceChannel', name: `Edexo ${branch.name} centre`, serviceLocation: { '@id': `${siteUrl()}/#centre-${branch.id}` } }] : [])],
  };

  return (
    <div className="loc-page">
      <JsonLd data={jsonLd} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
      <BreadcrumbLd crumbs={[{ label: 'Home', href: '/' }, { label: 'Areas We Serve', href: '/areas-we-serve' }, { label: place }]} />

      <section className="loc-hero">
        <div className="wrap loc-hero-grid">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <span className="crumb"><Icon name="home" size={14} /><Link href="/">Home</Link><Icon name="chevronRight" size={14} /></span>
              <span className="crumb"><Link href="/areas-we-serve">Areas We Serve</Link><Icon name="chevronRight" size={14} /></span>
              <span className="crumb">{place}</span>
            </nav>
            <span className="pill"><Icon name="pin" size={15} />{place}{l.region === 'Haryana' ? ', Haryana' : ', Delhi'}</span>
            <h1>German &amp; Foreign Language Classes in <span className="hl">{place}</span></h1>
            <p className="loc-lead">{l.intro || `Learn German, French, Spanish, Japanese, Chinese and English with Edexo — structured A1–C2 courses, exam preparation and online & offline classes for students and professionals in ${place}.`}</p>
            <ul className="loc-points">
              {centreLine && <li><Icon name="building" size={18} />{centreLine}</li>}
              <li><Icon name="laptop" size={18} />Live online classes from {place} — group or one-to-one</li>
              <li><Icon name="video" size={18} />Free demo class before you enrol</li>
            </ul>
            <div className="loc-ctas">
              {wa && <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} />WhatsApp Us</a>}
              {phone && <a className="btn btn-enroll" href={telHref(phone)}><Icon name="phone" size={18} />Call {phone}</a>}
            </div>
          </div>
          <div id="loc-enquiry" className="loc-form">
            <h2><Icon name="send" size={20} />Enquire for classes in {place}</h2>
            <LeadForm variant="compact" type="demo" className="card enquiry-form" source={`Location: ${place}`}
              languages={programLanguages(langs)} branches={branches.map((b) => b.name)} button="Book Free Demo"
              success={s(st, 'enquirySuccess', 'Thank you! We will contact you shortly.')} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap loc-about">
          <div>
            <span className="eyebrow"><Icon name="pin" size={15} />Language classes for {place}</span>
            <h2 className="h2">Learn a New Language — Close to {place}</h2>
            <p className="lead">{l.areaNote}</p>
            <p>Edexo offers structured language programs for students, professionals and international learners. Whether your goal is study, work, an exam or travel, learners from {place} can start at the beginner level or continue at an advanced level, with speaking, listening, reading and writing practice in every course.</p>
            {l.content && <div className="prose" style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(l.content) }} />}
          </div>
          {img ? <img className="loc-img" src={img} alt={`Language classes for students in ${place}`} loading="lazy" /> : (
            <div className="card loc-who">
              <h3><Icon name="users" size={20} />Who joins from {place}</h3>
              <ul className="tick-list">{audience.map((a) => <li key={a}><Icon name="checkCircle" size={17} />{a}</li>)}</ul>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-peach">
        <div className="wrap">
          <div className="section-head"><span className="eyebrow"><Icon name="languages" size={15} />Courses</span><h2 className="h2">Language Courses for Students in {place}</h2><p>Online and offline batches, group or one-to-one — choose your language and level.</p></div>
          <div className="program-grid">{popular.map((p) => <ProgramCard key={p.id} p={p} />)}</div>
          {others.length > 0 && (
            <div className="more-programs"><span>Also available:</span>{others.map((p) => <Link key={p.id} href={`/${p.slug}`}>{p.name}</Link>)}</div>
          )}
        </div>
      </section>

      {german && (
        <section className="section">
          <div className="wrap">
            <div className="section-head"><span className="eyebrow"><Icon name="wallet" size={15} />German A1–C2</span><h2 className="h2">German Course Fees for {place}</h2>{german.feeNote && <p>{german.feeNote}</p>}</div>
            <FeeTable p={german} />
            <p className="center" style={{ marginTop: 24 }}><Link className="btn btn-navy" href="/courses"><Icon name="wallet" size={17} />All Courses &amp; Fees</Link></p>
          </div>
        </section>
      )}

      <section className="section bg-navy-soft">
        <div className="wrap">
          <div className="section-head"><span className="eyebrow"><Icon name="navigation" size={15} />How to join</span><h2 className="h2">Two Ways to Learn from {place}</h2></div>
          <div className="format-grid">
            {branch && (
              <div className="card format-card">
                <IconBubble icon="building" tone="orange" size={56} iconSize={24} />
                <h3>Classroom batches at Edexo {branch.name}</h3>
                <p>{branch.address}</p>
                {branch.landmark && <p className="muted"><Icon name="navigation" size={15} /> {branch.landmark}</p>}
                {branch.hours && <p className="muted" style={{ whiteSpace: 'pre-line' }}><Icon name="clock" size={15} /> {branch.hours}</p>}
                <a className="btn btn-orange" href={branch.mapUrl || `https://www.google.com/maps/search/?api=1&query=${mapQ}`} target="_blank" rel="noopener noreferrer"><Icon name="navigation" size={17} />Get directions</a>
              </div>
            )}
            <div className="card format-card">
              <IconBubble icon="laptop" tone="navy" size={56} iconSize={24} />
              <h3>Live online classes from home</h3>
              <p>Join instructor-led classes from {place} with the same course plan as our classroom batches — no travel needed.</p>
              <ul className="tick-list">{['Group and one-to-one options', 'Weekday and weekend batches', 'Study material and regular assessments'].map((t) => <li key={t}><Icon name="checkCircle" size={17} />{t}</li>)}</ul>
              <Link className="btn btn-navy" href="/online-language-classes">Online classes<Icon name="arrowRight" size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head"><span className="eyebrow"><Icon name="sparkles" size={15} />Why Edexo</span><h2 className="h2">Why Learners from {place} Choose Edexo</h2></div>
          <div className="why-grid">
            {reasons.slice(0, 8).map((r) => (
              <div className="card why-item" key={r.id}><IconBubble icon={r.icon} tone={r.tone} size={46} iconSize={21} /><div><h3>{r.title}</h3>{r.description && <p>{r.description}</p>}</div></div>
            ))}
          </div>
          {img && audience.length > 0 && (
            <div className="card loc-who" style={{ marginTop: 28 }}>
              <h3><Icon name="users" size={20} />Who joins from {place}</h3>
              <ul className="tick-list two">{audience.map((a) => <li key={a}><Icon name="checkCircle" size={17} />{a}</li>)}</ul>
            </div>
          )}
        </div>
      </section>

      {exams.length > 0 && (
        <section className="section-sm bg-peach">
          <div className="wrap center">
            <h2 className="h3" style={{ justifyContent: 'center', marginBottom: 16 }}><Icon name="target" size={22} />Exam Preparation &amp; Study Abroad for {place}</h2>
            <div className="exam-chips" style={{ justifyContent: 'center' }}>
              {exams.slice(0, 11).map((e) => <Link key={e.id} href={`/${e.slug}`}>{e.title.replace(/ (Exam )?Preparation$/, '')}<Icon name="arrowRight" size={13} /></Link>)}
              <Link href="/study-in-germany">Study in Germany<Icon name="arrowRight" size={13} /></Link>
              <Link href="/ausbildung-in-germany">Ausbildung<Icon name="arrowRight" size={13} /></Link>
            </div>
          </div>
        </section>
      )}

      <section className="section" id="faqs">
        <div className="wrap faq-wrap">
          <div className="section-head"><span className="eyebrow"><Icon name="help" size={15} />FAQs</span><h2 className="h2">Language Classes in {place} — FAQs</h2></div>
          <FaqList items={faqs} schema={false} />
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="section-sm">
          <div className="wrap center">
            <h2 className="h3" style={{ justifyContent: 'center', marginBottom: 14 }}><Icon name="pin" size={20} />Nearby areas we serve</h2>
            <div className="related-chips" style={{ justifyContent: 'center' }}>
              {nearby.map((x) => <Link key={x.id} href={`/${x.slug}`}>{placeName(x)}</Link>)}
              <Link href="/areas-we-serve">All areas</Link>
            </div>
          </div>
        </section>
      )}

      <EnquiryBand source={`Location: ${place} (bottom form)`} title={`Start Your Language Journey in ${place}`} text="Choose your language. Choose your goal. Book a free demo class with Edexo." />
    </div>
  );
}
