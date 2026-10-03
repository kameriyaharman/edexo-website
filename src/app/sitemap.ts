import type { MetadataRoute } from 'next';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getCourses, getPosts } from '@/lib/data';
import { siteUrl } from '@/lib/seo';
import { mediaUrl } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [courses, posts, pages] = await Promise.all([
    getCourses(), getPosts(),
    db.select({ slug: schema.pages.slug, updatedAt: schema.pages.updatedAt }).from(schema.pages).where(eq(schema.pages.published, true)),
  ]);
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/courses`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/contact`, priority: 0.7 },
    ...courses.map((c) => ({ url: `${base}/courses/${c.slug}`, lastModified: c.updatedAt, priority: 0.8, ...(c.imageId ? { images: [base + mediaUrl(c.imageId)] } : {}) })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...pages.filter((p) => p.slug !== 'about').map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: /privacy|terms/.test(p.slug) ? 0.2 : 0.6 })),
    { url: `${base}/about`, priority: 0.6 },
  ];
}
