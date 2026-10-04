import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, PostCard } from '@/components/site/Blocks';
import { CtaBand } from '@/components/site/Platform';
import { getPosts } from '@/lib/data';
import { getSettings, s } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';
import { BLOG_CATEGORIES, categorySlug } from '@/lib/blog';

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const st = await getSettings();
  const { category } = await searchParams;
  const cat = BLOG_CATEGORIES.find((c) => categorySlug(c) === category);
  return pageMeta({
    title: cat ? `${cat} — Articles & Guides` : s(st, 'blogSeoTitle', 'Language Learning Blog — Tips, Exams & Study Abroad'),
    description: s(st, 'blogSeoDescription', 'Tips, exam guides and study/work abroad articles from the Edexo team.'),
    path: '/blog', noindex: !!cat,
  });
}

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [st, all] = await Promise.all([getSettings(), getPosts()]);
  const used = new Set(all.map((p) => p.category).filter(Boolean));
  const cats = [...BLOG_CATEGORIES.filter((c) => used.has(c)), ...[...used].filter((c) => !BLOG_CATEGORIES.includes(c!))] as string[];
  const active = cats.find((c) => categorySlug(c) === category);
  const posts = active ? all.filter((p) => p.category === active) : all;
  return (
    <>
      <PageHero title={s(st, 'blogTitle', 'Blog')} subtitle={active ? `Category: ${active}` : 'Tips, exam guides and study & work abroad articles.'} crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
      <section className="section">
        <div className="wrap">
          {cats.length > 0 && (
            <nav className="cat-chips" aria-label="Categories">
              <Link href="/blog" aria-current={!active ? 'page' : undefined}>All</Link>
              {cats.map((c) => <Link key={c} href={`/blog?category=${categorySlug(c)}`} aria-current={active === c ? 'page' : undefined}>{c}</Link>)}
            </nav>
          )}
          {posts.length ? <div className="post-grid">{posts.map((p) => <PostCard key={p.id} p={p} />)}</div> : <p className="empty">No articles yet.</p>}
        </div>
      </section>
      <CtaBand demoHref="/contact?type=demo#enquiry" />
    </>
  );
}
