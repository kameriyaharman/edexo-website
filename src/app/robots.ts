import type { MetadataRoute } from 'next';
import { canIndex, siteUrl } from '@/lib/seo';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // a robots.txt that answers 5xx makes Google pause crawling the whole site, so a DB hiccup must not break it
  let st: Awaited<ReturnType<typeof getSettings>> | null = null;
  try { st = await getSettings(); } catch { /* fall back to the normal rules */ }
  if (st && !canIndex(st)) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{
      userAgent: '*', allow: '/',
      // parameter copies of real pages (form pre-fills, blog filters) only waste crawl budget — their canonical is the clean URL
      disallow: ['/admin', '/api', '/thank-you', '/*?course=', '/*?program=', '/*?category=', '/*&course='],
    }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
