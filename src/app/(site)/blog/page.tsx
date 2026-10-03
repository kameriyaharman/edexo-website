import type { Metadata } from 'next';
import { PageHero, PostCard } from '@/components/site/Blocks';
import { getPosts } from '@/lib/data';
import { getSettings, s } from '@/lib/settings';

export const metadata: Metadata = { title: 'Blog', description: 'Tips, guides and news on learning German and studying in Germany.' };

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
