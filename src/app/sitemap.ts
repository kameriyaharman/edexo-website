import type { MetadataRoute } from 'next';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getCourses, getLocations, getPosts, getPrograms } from '@/lib/data';
import { siteUrl } from '@/lib/seo';
import { mediaUrl } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [courses, posts, pages, programs] = await Promise.all([
    getCourses(), getPosts(),
    db.select({ slug: schema.pages.slug, updatedAt: schema.pages.updatedAt, kind: schema.pages.kind }).from(schema.pages).where(eq(schema.pages.published, true)),
    getPrograms(),
  ]);
  const locs = await getLocations();
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/courses`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/contact`, priority: 0.7 },
    { url: `${base}/faqs`, priority: 0.5 },
    { url: `${base}/areas-we-serve`, priority: 0.6 },
    ...locs.map((l) => ({ url: `${base}/${l.slug}`, lastModified: l.updatedAt, priority: 0.7 })),
    ...programs.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: 0.9, ...(p.imageId ? { images: [base + mediaUrl(p.imageId)] } : {}) })),
    ...courses.map((c) => ({ url: `${base}/${c.slug}`, lastModified: c.updatedAt, priority: 0.8, ...(c.imageId ? { images: [base + mediaUrl(c.imageId)] } : {}) })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...pages.filter((p) => p.slug !== 'about').map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: p.kind === 'legal' ? 0.2 : p.kind === 'service' || p.kind === 'exam' ? 0.8 : 0.6 })),
    { url: `${base}/about`, priority: 0.6 },
  ];
}
