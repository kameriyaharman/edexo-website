import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, PostCard } from '@/components/site/Blocks';
import { getPost, getPosts } from '@/lib/data';
import { formatDate, mediaUrl } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  const img = mediaUrl(p.coverId);
  return {
    title: p.seoTitle || p.title, description: p.seoDescription || p.excerpt || undefined,
    openGraph: { type: 'article', images: img ? [img] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  const img = mediaUrl(p.coverId);
  const more = (await getPosts(4)).filter((x) => x.id !== p.id).slice(0, 3);
  return (
    <>
      <PageHero title={p.title} subtitle={`${formatDate(p.publishedAt)}${p.author ? ' · ' + p.author : ''}`}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: p.title }]} />
      <section className="section">
        <div className="wrap" style={{ maxWidth: 860 }}>
          {img && <img className="course-cover" src={img} alt="" />}
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
