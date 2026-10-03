import type { Metadata } from 'next';
import { PageHero, PostCard } from '@/components/site/Blocks';
import { getPosts } from '@/lib/data';
import { getSettings, s } from '@/lib/settings';

import { pageMeta } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const st = await getSettings();
  return pageMeta({
    title: s(st, 'blogSeoTitle', 'German Learning Blog — Tips & Study in Germany Guides'),
    description: s(st, 'blogSeoDescription', 'Tips, guides and news on learning German and studying or working in Germany from the Edexo team.'),
    path: '/blog',
  });
}

export default async function BlogPage() {
  const [st, posts] = await Promise.all([getSettings(), getPosts()]);
  return (
    <>
      <PageHero title={s(st, 'blogTitle', 'Blog')} crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
      <section className="section">
        <div className="wrap">
          {posts.length ? <div className="post-grid">{posts.map((p) => <PostCard key={p.id} p={p} />)}</div> : <p className="empty">No articles yet.</p>}
        </div>
      </section>
    </>
  );
}
