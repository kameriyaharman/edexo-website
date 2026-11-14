'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/auth';

export type SeoState = { ok?: string; error?: string } | undefined;

/** Settings keys a fixed page may write (home, courses, blog…). Anything else is refused. */
const SETTING_KEYS = new Set([
  'seoTitle', 'seoDescription', 'coursesSeoTitle', 'coursesSeoDescription', 'blogSeoTitle', 'blogSeoDescription',
  'contactSeoTitle', 'contactSeoDescription', 'batchesSeoTitle', 'batchesSeoDescription', 'faqsSeoTitle', 'faqsSeoDescription',
  'areasSeoTitle', 'areasSeoDescription', 'enrollSeoTitle', 'enrollSeoDescription', 'rohiniSeoTitle', 'rohiniSeoDescription',
]);

const TABLES = {
  courses: schema.courses, languages: schema.languages, pages: schema.pages, locations: schema.locations, posts: schema.posts,
} as const;

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** Saves the Google title + description of one URL from the "SEO – all pages" screen. */
export async function saveSeo(_: SeoState, fd: FormData): Promise<SeoState> {
  await requireAdmin();
  const kind = String(fd.get('kind') ?? '');
  const title = clean(fd.get('title'), 120);
  const description = clean(fd.get('description'), 320);
  try {
    if (kind === 'setting') {
      const tKey = String(fd.get('titleKey') ?? '');
      const dKey = String(fd.get('descKey') ?? '');
      if (!SETTING_KEYS.has(tKey) || !SETTING_KEYS.has(dKey)) return { error: 'Unknown page' };
      const [row] = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);
      const data = { ...(row?.data ?? {}), [tKey]: title, [dKey]: description } as Record<string, unknown>;
      if (row) await db.update(schema.settings).set({ data, updatedAt: new Date() }).where(eq(schema.settings.id, 1));
      else await db.insert(schema.settings).values({ id: 1, data });
    } else if (kind in TABLES) {
      const id = Number(fd.get('id'));
      if (!Number.isInteger(id) || id < 1) return { error: 'Unknown record' };
      const table = TABLES[kind as keyof typeof TABLES] as typeof schema.pages;
      await db.update(table).set({ seoTitle: title, seoDescription: description } as never).where(eq(table.id, id));
    } else return { error: 'Unknown page type' };
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath('/', 'layout');
  return { ok: title || description ? 'Saved' : 'Saved — using automatic text' };
}
