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

/* ---------- programs, menus, FAQs, jobs (international platform) ---------- */
export type Program = typeof t.languages.$inferSelect & { courses: CourseRow[] };
export type MenuNode = typeof t.menuItems.$inferSelect & { children: (typeof t.menuItems.$inferSelect)[] };

/** Menu with one level of children (dropdowns). Children of hidden parents are dropped. */
export const getMenuTree = cache(async (location: string): Promise<MenuNode[]> => {
  const rows = await getMenu(location);
  const top = rows.filter((r) => !r.parentId);
  return top.map((p) => ({ ...p, children: rows.filter((r) => r.parentId === p.id) }));
});

export const getPrograms = cache(async (): Promise<Program[]> => {
  const [langs, courses] = await Promise.all([getLanguages(), getCourses()]);
  return langs.map((l) => ({ ...l, courses: courses.filter((c) => c.languageId === l.id) }));
});

export const getProgram = cache(async (slug: string) => (await getPrograms()).find((p) => p.slug === slug) ?? null);

export const getFaqs = cache(async () => activeSorted(await db.select().from(t.faqs)));
export const getTrainers = cache(async () => activeSorted(await db.select().from(t.trainers)));
export const getJobs = cache(async () => activeSorted(await db.select().from(t.jobs)));

export const getPagesByKind = cache(async (kind: string) =>
  (await db.select().from(t.pages).where(and(eq(t.pages.kind, kind), eq(t.pages.published, true))))
    .sort((a, b) => a.sort - b.sort || a.id - b.id));

/** Lowest fee across a program's levels, for "from ₹…" labels. */
export function fromPrice(p: Program): number | null {
  const all = p.courses.flatMap((c) => [c.price, c.priceOffline]).filter((n): n is number => typeof n === 'number' && n > 0);
  return all.length ? Math.min(...all) : null;
}

/** Parse "Question\nAnswer…\n\nQuestion\nAnswer" blocks used by FAQ text fields. */
export function parseFaqs(text: string | null | undefined): { q: string; a: string }[] {
  return (text ?? '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).map((b) => {
    const [q, ...rest] = b.split('\n');
    return { q: q.replace(/^Q[:.]\s*/i, '').trim(), a: rest.join('\n').replace(/^A[:.]\s*/i, '').trim() };
  }).filter((f) => f.q && f.a);
}

export function readingTime(md: string | null | undefined): number {
  return Math.max(1, Math.round((md ?? '').split(/\s+/).filter(Boolean).length / 200));
}

/* ---------- service-area (location) pages ---------- */
export const getLocations = cache(async () => activeSorted(await db.select().from(t.locations)));
export const getLocation = cache(async (slug: string) => (await getLocations()).find((l) => l.slug === slug) ?? null);
