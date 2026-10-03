import type { Metadata } from 'next';
import { and, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getSettings, s, on, imageId, type Settings } from './settings';
import { mediaUrl } from './format';

export function siteUrl(): string {
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/** The Railway preview domain must never be indexed (it would compete with edexo.in). */
export function isStaging(): boolean {
  return /\.up\.railway\.app|localhost|127\.0\.0\.1/.test(siteUrl());
}

export function canIndex(st: Settings): boolean {
  return !isStaging() && on(st, 'robotsIndex');
}

export const abs = (path: string) => (/^https?:/.test(path) ? path : siteUrl() + (path.startsWith('/') ? path : '/' + path));

/** Builds full metadata for a page: title, description, canonical, Open Graph, Twitter. */
export async function pageMeta(opts: {
  title?: string | null; description?: string | null; path: string; imageId?: number | null;
  type?: 'website' | 'article'; publishedTime?: Date | null; noindex?: boolean;
}): Promise<Metadata> {
  const st = await getSettings();
  const siteName = s(st, 'siteName', 'Edexo');
  const description = (opts.description || s(st, 'seoDescription')).slice(0, 300);
  const img = mediaUrl(opts.imageId ?? null) ?? mediaUrl(imageId(st, 'ogImageId'));
  const title = opts.title || s(st, 'seoTitle', siteName);
  const url = abs(opts.path);
  return {
    title: opts.title ? opts.title : { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: opts.type ?? 'website', url, siteName, title: opts.title ? `${opts.title} | ${siteName}` : title, description, locale: 'en_IN',
      images: img ? [{ url: abs(img), alt: opts.title ?? siteName }] : undefined,
      ...(opts.type === 'article' && opts.publishedTime ? { publishedTime: new Date(opts.publishedTime).toISOString() } : {}),
    },
    twitter: { card: 'summary_large_image', title: opts.title ? `${opts.title} | ${siteName}` : title, description, images: img ? [abs(img)] : undefined },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Looks up an admin-managed redirect for a path (with or without trailing slash). */
export async function findRedirect(path: string): Promise<{ to: string; permanent: boolean } | null> {
  const clean = ('/' + path.replace(/^\/+/, '')).replace(/\/+$/, '') || '/';
  const candidates = [clean, clean + '/', clean.toLowerCase()];
  for (const c of candidates) {
    const [r] = await db.select().from(schema.redirects)
      .where(and(eq(schema.redirects.fromPath, c), eq(schema.redirects.active, true))).limit(1);
    if (r) {
      db.update(schema.redirects).set({ hits: sql`${schema.redirects.hits} + 1` }).where(eq(schema.redirects.id, r.id)).catch(() => {});
      return { to: r.toPath, permanent: r.permanent };
    }
  }
  return null;
}
