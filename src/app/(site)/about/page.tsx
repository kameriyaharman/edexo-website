import type { Metadata } from 'next';
import { PageHero } from '@/components/site/Blocks';
import { AboutSection, BranchesSection, EnquiryBand, LevelsSection, TestimonialsSection } from '@/components/site/Sections';
import { getPage } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';
import { mediaUrl } from '@/lib/format';

import { pageMeta } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('about');
  return pageMeta({ title: p?.seoTitle || p?.title || 'About Us', description: p?.seoDescription || p?.subtitle, path: '/about', imageId: p?.imageId });
}

export default async function AboutPage() {
  const p = await getPage('about');
  const img = mediaUrl(p?.imageId);
  return (
    <>
      <PageHero title={p?.title ?? 'About Us'} subtitle={p?.subtitle} crumbs={[{ label: 'Home', href: '/' }, { label: p?.title ?? 'About Us' }]} />
      {p?.content && (
        <section className="section">
          <div className="wrap">
            {img && <img className="course-cover" src={img} alt="" />}
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
          </div>
        </section>
      )}
      <AboutSection />
      <LevelsSection />
      <TestimonialsSection />
      <EnquiryBand />
      <BranchesSection />
    </>
  );
}
