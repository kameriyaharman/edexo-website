import { cache } from 'react';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db, schema as t } from '@/db';

export const getMenu = cache(async (location: string) =>
  db.select().from(t.menuItems)
    .where(and(eq(t.menuItems.location, location), eq(t.menuItems.active, true)))
    .orderBy(asc(t.menuItems.sort), asc(t.menuItems.id)));

export const getLanguages = cache(async () =>
  db.select().from(t.languages).where(eq(t.languages.active, true)).orderBy(asc(t.languages.sort), asc(t.languages.id)));

export type CourseRow = typeof t.courses.$inferSelect & { languageName: string | null; languageSlug: string | null; languageCode: string | null };

export const getCourses = cache(async (): Promise<CourseRow[]> => {
  const rows = await db.select({
    c: t.courses, languageName: t.languages.name, languageSlug: t.languages.slug, languageCode: t.languages.code,
  }).from(t.courses)
    .leftJoin(t.languages, eq(t.courses.languageId, t.languages.id))
    .where(eq(t.courses.published, true))
    .orderBy(asc(t.languages.sort), asc(t.courses.sort), asc(t.courses.id));
  return rows.map((r) => ({ ...r.c, languageName: r.languageName, languageSlug: r.languageSlug, languageCode: r.languageCode }));
});

export const getCourse = cache(async (slug: string) => (await getCourses()).find((c) => c.slug === slug) ?? null);

const activeSorted = <T extends { sort: number; id: number; active: boolean }>(rows: T[]) =>
  rows.filter((r) => r.active).sort((a, b) => a.sort - b.sort || a.id - b.id);

export const getFeatures = cache(async () => activeSorted(await db.select().from(t.features)));
export const getLevels = cache(async () => activeSorted(await db.select().from(t.levels)));
export const getReasons = cache(async () => activeSorted(await db.select().from(t.reasons)));
export const getTestimonials = cache(async () => activeSorted(await db.select().from(t.testimonials)));
export const getStats = cache(async () => activeSorted(await db.select().from(t.stats)));
export const getBranches = cache(async () => activeSorted(await db.select().from(t.branches)));

export const getPosts = cache(async (limit?: number) => {
  const q = db.select().from(t.posts).where(eq(t.posts.published, true)).orderBy(desc(t.posts.publishedAt), desc(t.posts.id));
  return limit ? q.limit(limit) : q;
});

export const getPost = cache(async (slug: string) =>
  (await db.select().from(t.posts).where(and(eq(t.posts.slug, slug), eq(t.posts.published, true))).limit(1))[0] ?? null);

export const getPage = cache(async (slug: string) =>
  (await db.select().from(t.pages).where(and(eq(t.pages.slug, slug), eq(t.pages.published, true))).limit(1))[0] ?? null);
