import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/site/Blocks';
import { EnquiryBand } from '@/components/site/Sections';
import { getPage } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';
import { mediaUrl } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPage((await params).slug);
  if (!p) return {};
  return { title: p.seoTitle || p.title, description: p.seoDescription || p.subtitle || undefined };
}

export default async function CmsPage({ params }: Props) {
  const p = await getPage((await params).slug);
  if (!p) notFound();
  const img = mediaUrl(p.imageId);
  const legal = /privacy|terms|policy|refund/.test(p.slug);
  return (
    <>
      <PageHero title={p.title} subtitle={p.subtitle} crumbs={[{ label: 'Home', href: '/' }, { label: p.title }]} />
      <section className="section">
        <div className="wrap">
          {img && <img className="course-cover" src={img} alt="" />}
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
        </div>
      </section>
      {!legal && <EnquiryBand />}
    </>
  );
}
