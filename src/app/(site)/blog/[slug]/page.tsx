import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, PostCard } from '@/components/site/Blocks';
import { getCourses, getPost, getPosts, getPrograms, parseFaqs, readingTime } from '@/lib/data';
import { CtaBand, FaqList, Ticks } from '@/components/site/Platform';
import { splitLines } from '@/lib/format';
import { categorySlug } from '@/lib/blog';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
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
  const all = await getPosts();
  const more = [...all.filter((x) => x.id !== p.id && p.category && x.category === p.category), ...all.filter((x) => x.id !== p.id && x.category !== p.category)].slice(0, 3);
  const faqs = parseFaqs(p.faqs);
  const keyPoints = splitLines(p.keyPoints);
  const program = p.relatedLanguageId ? (await getPrograms()).find((x) => x.id === p.relatedLanguageId) : null;
  const relatedCourses = program ? program.courses.slice(0, 4) : (await getCourses()).filter((c) => c.featured).slice(0, 3);
  return (
    <>
      <JsonLd data={ld} />
      <PageHero title={p.title} subtitle={[formatDate(p.publishedAt), p.author, `${readingTime(p.content)} min read`].filter(Boolean).join(' · ')}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: p.title }]} />
      <section className="section">
        <div className="wrap" style={{ maxWidth: 860 }}>
          {p.category && <p><Link className="cat-pill" href={`/blog?category=${categorySlug(p.category)}`}><Icon name="bookmark" size={14} />{p.category}</Link></p>}
          {img && <img className="course-cover" src={img} alt={p.title} />}
          {keyPoints.length > 0 && <div className="card key-points"><h2 className="h3"><Icon name="lightbulb" size={20} />Key points</h2><Ticks items={keyPoints} /></div>}
          <article className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
          {faqs.length > 0 && <div className="c-block"><h2 className="h3">FAQs</h2><FaqList items={faqs} /></div>}
          {relatedCourses.length > 0 && (
            <div className="c-block">
              <h2 className="h3">Related courses</h2>
              <div className="related-chips">{relatedCourses.map((c) => <Link key={c.id} href={`/${c.slug}`}>{c.title}</Link>)}{program && <Link href={`/${program.slug}`}>All {program.name} levels</Link>}</div>
            </div>
          )}
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
      <CtaBand demoHref="/contact?type=demo#enquiry" />
    </>
  );
}
