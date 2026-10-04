import type { Metadata } from 'next';
import { PageHero } from '@/components/site/Blocks';
import { EnquiryBand, TestimonialsSection } from '@/components/site/Sections';
import { WhySection } from '@/components/site/HomeSections';
import { HighlightGrid } from '@/components/site/Platform';
import { getPage, getTrainers } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';
import { mediaUrl, splitLines } from '@/lib/format';
import { pageMeta } from '@/lib/seo';
import { Icon } from '@/components/Icon';

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('about');
  return pageMeta({ title: p?.seoTitle || p?.title || 'About Us', description: p?.seoDescription || p?.subtitle, path: '/about', imageId: p?.imageId });
}

export default async function AboutPage() {
  const [p, trainers] = await Promise.all([getPage('about'), getTrainers()]);
  const img = mediaUrl(p?.imageId);
  return (
    <>
      <PageHero title={p?.title ?? 'About Us'} subtitle={p?.subtitle} crumbs={[{ label: 'Home', href: '/' }, { label: p?.title ?? 'About Us' }]} />
      {p && (
        <section className="section">
          <div className="wrap">
            {img && <img className="course-cover" src={img} alt="" />}
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
            <HighlightGrid title={p.highlightsTitle} items={splitLines(p.highlights)} />
          </div>
        </section>
      )}
      <WhySection />
      {trainers.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head"><span className="eyebrow"><Icon name="users" size={15} />Our team</span><h2 className="h2">Meet Our Trainers</h2></div>
            <div className="trainer-grid">
              {trainers.map((t) => (
                <div className="card trainer" key={t.id}>
                  {t.photoId ? <img src={mediaUrl(t.photoId)!} alt={t.name} loading="lazy" /> : <span className="trainer-ph"><Icon name="user" size={40} /></span>}
                  <h3>{t.name}</h3>
                  {t.role && <span className="trainer-role">{t.role}</span>}
                  {t.languages && <span className="trainer-langs"><Icon name="languages" size={14} />{t.languages}</span>}
                  {t.bio && <p>{t.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <TestimonialsSection />
      <EnquiryBand />
    </>
  );
}
