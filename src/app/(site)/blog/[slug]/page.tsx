import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, PostCard } from '@/components/site/Blocks';
import { getPost, getPosts } from '@/lib/data';
import { formatDate, mediaUrl } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';
import { abs, findRedirect, pageMeta, siteUrl } from '@/lib/seo';
import { JsonLd } from '@/components/site/StructuredData';
import { permanentRedirect, redirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return pageMeta({ title: p.seoTitle || p.title, description: p.seoDescription || p.excerpt, path: `/blog/${p.slug}`, imageId: p.coverId, type: 'article', publishedTime: p.publishedAt });
}

export default async function PostPage({ params }: Props) {
  const slug = (await params).slug;
  const p = await getPost(slug);
  if (!p) {
    const r = await findRedirect(`/blog/${slug}`);
    if (r) (r.permanent ? permanentRedirect : redirect)(r.to);
    notFound();
  }
  const img = mediaUrl(p.coverId);
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt || p.title,
    url: abs(`/blog/${p.slug}`), mainEntityOfPage: abs(`/blog/${p.slug}`), ...(img ? { image: abs(img) } : {}),
    datePublished: p.publishedAt?.toISOString(), dateModified: p.updatedAt.toISOString(), inLanguage: 'en-IN',
    author: { '@type': 'Organization', name: p.author || 'Edexo' },
    publisher: { '@type': 'Organization', '@id': `${siteUrl()}/#organization`, name: 'Edexo' },
  };
  const more = (await getPosts(4)).filter((x) => x.id !== p.id).slice(0, 3);
  return (
    <>
      <JsonLd data={ld} />
      <PageHero title={p.title} subtitle={`${formatDate(p.publishedAt)}${p.author ? ' · ' + p.author : ''}`}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: p.title }]} />
      <section className="section">
        <div className="wrap" style={{ maxWidth: 860 }}>
          {img && <img className="course-cover" src={img} alt={p.title} />}
          <article className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
        </div>
      </section>
      {more.length > 0 && (
        <section className="section bg-peach">
          <div className="wrap">
            <h2 className="h2" style={{ marginBottom: 36 }}>More articles</h2>
            <div className="post-grid">{more.map((x) => <PostCard key={x.id} p={x} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
