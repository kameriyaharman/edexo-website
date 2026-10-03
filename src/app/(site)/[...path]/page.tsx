import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { PageHero } from '@/components/site/Blocks';
import { EnquiryBand } from '@/components/site/Sections';
import { getPage } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';
import { mediaUrl } from '@/lib/format';
import { findRedirect, pageMeta } from '@/lib/seo';

type Props = { params: Promise<{ path: string[] }> };

async function load(params: Props['params']) {
  const parts = (await params).path.map(decodeURIComponent);
  const page = parts.length === 1 ? await getPage(parts[0]) : null;
  return { parts, page };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: p } = await load(params);
  if (!p) return {};
  return pageMeta({ title: p.seoTitle || p.title, description: p.seoDescription || p.subtitle, path: `/${p.slug}`, imageId: p.imageId });
}

/** CMS pages at /slug. Anything else is checked against admin redirects (old site URLs) before a 404. */
export default async function CmsPage({ params }: Props) {
  const { parts, page: p } = await load(params);
  if (!p) {
    const r = await findRedirect('/' + parts.join('/'));
    if (r) (r.permanent ? permanentRedirect : redirect)(r.to);
    notFound();
  }
  const img = mediaUrl(p.imageId);
  const legal = /privacy|terms|policy|refund/.test(p.slug);
  return (
    <>
      <PageHero title={p.title} subtitle={p.subtitle} crumbs={[{ label: 'Home', href: '/' }, { label: p.title }]} />
      <section className="section">
        <div className="wrap">
          {img && <img className="course-cover" src={img} alt={p.title} />}
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
        </div>
      </section>
      {!legal && <EnquiryBand />}
    </>
  );
}
