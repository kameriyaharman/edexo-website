import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/site/Blocks';
import { CourseCard } from '@/components/site/CourseCard';
import { EnquiryBand } from '@/components/site/Sections';
import { Icon } from '@/components/Icon';
import { getCourse, getCourses } from '@/lib/data';
import { inr, mediaUrl, splitLines } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCourse((await params).slug);
  if (!c) return {};
  const img = mediaUrl(c.imageId);
  return {
    title: c.seoTitle || c.title,
    description: c.seoDescription || c.shortDesc || undefined,
    openGraph: img ? { images: [img] } : undefined,
  };
}

export default async function CoursePage({ params }: Props) {
  const c = await getCourse((await params).slug);
  if (!c) notFound();
  const img = mediaUrl(c.imageId);
  const related = (await getCourses()).filter((x) => x.languageId === c.languageId && x.id !== c.id).slice(0, 3);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Course', name: c.title, description: c.shortDesc,
    provider: { '@type': 'EducationalOrganization', name: 'Edexo' },
    ...(c.price ? { offers: { '@type': 'Offer', price: c.price, priceCurrency: 'INR', category: 'Paid' } } : {}),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero title={c.title} subtitle={c.shortDesc}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Courses', href: '/courses' }, ...(c.languageName ? [{ label: c.languageName, href: `/courses?language=${c.languageSlug}` }] : []), { label: c.title }]} />
      <section className="section">
        <div className="wrap course-layout">
          <div>
            {img && <img className="course-cover" src={img} alt={`${c.title} class`} />}
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(c.description) }} />
          </div>
          <aside className="card course-aside">
            {c.price !== null && (
              <div className="price"><strong>{inr(c.price)}</strong>{c.mrp && c.mrp > c.price ? <s>{inr(c.mrp)}</s> : null}</div>
            )}
            <ul>
              {c.level && <li><Icon name="book" size={18} />Level: {c.level}</li>}
              {c.duration && <li><Icon name="clock" size={18} />Duration: {c.duration}</li>}
              {c.mode && <li><Icon name="laptop" size={18} />{c.mode}</li>}
              {splitLines(c.highlights).map((h) => <li key={h}><Icon name="check" size={18} stroke={3} />{h}</li>)}
            </ul>
            <Link className="btn btn-orange" style={{ width: '100%' }} href="#enroll">Book a Free Demo</Link>
          </aside>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section bg-peach">
          <div className="wrap">
            <h2 className="h2" style={{ marginBottom: 36 }}>More {c.languageName} courses</h2>
            <div className="course-grid">{related.map((r) => <CourseCard key={r.id} c={r} />)}</div>
          </div>
        </section>
      )}
      <EnquiryBand defaultCourse={c.title} />
    </>
  );
}
