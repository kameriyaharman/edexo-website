import Link from 'next/link';
import { asc, desc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getSettings, s } from '@/lib/settings';
import { getBranches, getPrograms, type CourseRow } from '@/lib/data';
import { courseFacts } from '@/lib/course-seo';
import { siteUrl } from '@/lib/seo';
import { ROHINI_GERMAN_DEFAULTS, ROHINI_GERMAN_PATH } from '@/components/site/GermanRohiniPage';
import { placeName } from '@/components/site/LocationPage';
import { SeoRow, type SeoRowData } from '@/admin/SeoRow';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'SEO – all pages' };
export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ group?: string; q?: string; filter?: string }> };

const GROUPS = [
  ['main', 'Main pages'], ['programs', 'Programs'], ['courses', 'Courses'], ['pages', 'Pages'], ['locations', 'Locations'], ['posts', 'Blog posts'],
] as const;

export default async function SeoPages({ searchParams }: Props) {
  const sp = await searchParams;
  const st = await getSettings();
  const branchNames = (await getBranches()).map((b) => b.name);
  const programs = await getPrograms();
  const homeDesc = s(st, 'seoDescription');

  const fixed = (label: string, url: string, key: string, autoTitle: string, autoDescription: string, extra: Partial<SeoRowData> = {}): SeoRowData => ({
    key: `main-${key}`, url, label, group: 'main', live: true,
    title: s(st, `${key}SeoTitle`), description: s(st, `${key}SeoDescription`), autoTitle, autoDescription,
    hidden: { kind: 'setting', titleKey: `${key}SeoTitle`, descKey: `${key}SeoDescription` }, ...extra,
  });

  const rows: SeoRowData[] = [
    {
      key: 'main-home', url: '/', label: 'Home page', group: 'main', live: true, noSuffix: true,
      title: s(st, 'seoTitle'), description: homeDesc, autoTitle: s(st, 'siteName', 'Edexo'), autoDescription: '',
      hidden: { kind: 'setting', titleKey: 'seoTitle', descKey: 'seoDescription' },
    },
    fixed('Courses & Fees', '/courses', 'courses', 'Courses & Fees', 'Course fees for every Edexo language program — online and offline.'),
    fixed('Upcoming batches', '/upcoming-batches', 'batches', 'Upcoming Batches — German & Foreign Language Classes', 'New batch dates, days, class timings, mode and seats for German, French and other language courses at Edexo, online and at our Delhi centres. Book a free demo.'),
    fixed('German in Rohini', ROHINI_GERMAN_PATH, 'rohini', ROHINI_GERMAN_DEFAULTS.title, ROHINI_GERMAN_DEFAULTS.description),
    fixed('Blog', '/blog', 'blog', 'Language Learning Blog — Tips, Exams & Study Abroad', 'Tips, exam guides and study/work abroad articles from the Edexo team.'),
    fixed('Contact', '/contact', 'contact', 'Contact Edexo — Rohini & Dwarka, Delhi', 'Contact Edexo to book a free demo class — WhatsApp, call, email or visit our Rohini and Dwarka centres.'),
    fixed('FAQs', '/faqs', 'faqs', 'FAQs — Courses, Fees, Online Classes & Exams', 'Answers to common questions about Edexo language courses, fees, online classes, exam preparation and study abroad.'),
    fixed('Areas We Serve', '/areas-we-serve', 'areas', 'Areas We Serve — Language Classes across North & North-West Delhi | Edexo', 'Edexo German and foreign language classes for students in Rohini, Pitampura, Model Town, North Campus, Burari, Narela, Sonipat and more — online and at our Delhi centres.'),
    fixed('Enroll', '/enroll', 'enroll', 'Enroll Now — Choose Your Course & Pay Online', 'Enroll in an Edexo language course: choose your language and level, online or offline, and pay securely online.'),
  ];

  const langs = await db.select().from(schema.languages).orderBy(asc(schema.languages.sort), asc(schema.languages.id));
  for (const l of langs) rows.push({
    key: `programs-${l.id}`, url: `/${l.slug}`, label: l.name, group: 'programs', live: l.active,
    title: l.seoTitle ?? '', description: l.seoDescription ?? '', autoTitle: l.title || l.name, autoDescription: l.intro || homeDesc,
    hidden: { kind: 'languages', id: String(l.id) }, editHref: `/admin/languages/${l.id}`,
  });

  const langById = new Map(langs.map((l) => [l.id, l]));
  const courses = await db.select().from(schema.courses).orderBy(asc(schema.courses.sort), asc(schema.courses.id));
  for (const c of courses) {
    const l = c.languageId ? langById.get(c.languageId) : undefined;
    const row = { ...c, languageName: l?.name ?? null, languageSlug: l?.slug ?? null, languageCode: l?.code ?? null } as CourseRow;
    const f = courseFacts(row, programs.find((p) => p.id === c.languageId) ?? null, branchNames);
    rows.push({
      key: `courses-${c.id}`, url: `/${c.slug}`, label: c.title, group: 'courses', live: c.published && (l?.active ?? true),
      title: c.seoTitle ?? '', description: c.seoDescription ?? '', autoTitle: f.seoTitle, autoDescription: f.seoDescription,
      hidden: { kind: 'courses', id: String(c.id) }, editHref: `/admin/courses/${c.id}`,
    });
  }

  for (const p of await db.select().from(schema.pages).orderBy(asc(schema.pages.sort), asc(schema.pages.id))) rows.push({
    key: `pages-${p.id}`, url: `/${p.slug}`, label: p.title, group: 'pages', live: p.published,
    title: p.seoTitle ?? '', description: p.seoDescription ?? '', autoTitle: p.title, autoDescription: p.subtitle || homeDesc,
    hidden: { kind: 'pages', id: String(p.id) }, editHref: `/admin/pages/${p.id}`,
  });

  for (const l of await db.select().from(schema.locations).orderBy(asc(schema.locations.sort), asc(schema.locations.id))) rows.push({
    key: `locations-${l.id}`, url: `/${l.slug}`, label: l.name, group: 'locations', live: l.active,
    title: l.seoTitle ?? '', description: l.seoDescription ?? '',
    autoTitle: `German & Foreign Language Classes in ${placeName(l)}`,
    autoDescription: `Language classes for students in ${placeName(l)} — German A1–C2, French, Spanish, Japanese and more, online and offline.`,
    hidden: { kind: 'locations', id: String(l.id) }, editHref: `/admin/locations/${l.id}`,
  });

  for (const p of await db.select().from(schema.posts).orderBy(desc(schema.posts.publishedAt), desc(schema.posts.id))) rows.push({
    key: `posts-${p.id}`, url: `/blog/${p.slug}`, label: p.title, group: 'posts', live: p.published,
    title: p.seoTitle ?? '', description: p.seoDescription ?? '', autoTitle: p.title, autoDescription: p.excerpt || homeDesc,
    hidden: { kind: 'posts', id: String(p.id) }, editHref: `/admin/posts/${p.id}`,
  });

  const group = GROUPS.some(([k]) => k === sp.group) ? sp.group! : 'main';
  const q = (sp.q ?? '').trim().toLowerCase();
  const filter = sp.filter ?? '';
  const count = (g: string) => rows.filter((r) => r.group === g).length;
  const custom = rows.filter((r) => r.title || r.description).length;
  let list = q ? rows.filter((r) => `${r.label} ${r.url} ${r.title}`.toLowerCase().includes(q)) : rows.filter((r) => r.group === group);
  if (filter === 'auto') list = list.filter((r) => !r.title && !r.description);
  if (filter === 'custom') list = list.filter((r) => r.title || r.description);
  const href = (o: Record<string, string>) => `/admin/seo-pages?${new URLSearchParams({ group, ...(filter ? { filter } : {}), ...o })}`;

  return (
    <>
      <div className="a-top">
        <div>
          <h1><span className="a-title-ic"><Icon name="search" size={22} /></span>SEO – all pages</h1>
          <p>Google title and description for every page of the website. Leave a box empty to use the automatic text shown in grey. {custom} of {rows.length} pages have custom text.</p>
        </div>
        <div className="a-top-actions"><Link className="a-btn" href="/admin/settings/seo"><Icon name="filter" size={15} />Site-wide SEO settings</Link></div>
      </div>
      <form className="a-toolbar">
        <input type="hidden" name="group" value={group} />
        <label className="a-search"><Icon name="search" size={17} /><input name="q" defaultValue={sp.q ?? ''} placeholder="Search all pages by name or URL…" aria-label="Search pages" /></label>
        <span className="a-count-pill">{list.length} {list.length === 1 ? 'page' : 'pages'}</span>
      </form>
      {!q && (
        <div className="a-tabs">
          {GROUPS.map(([k, l]) => <Link key={k} href={`/admin/seo-pages?group=${k}${filter ? `&filter=${filter}` : ''}`} aria-current={group === k ? 'page' : undefined}>{l} ({count(k)})</Link>)}
        </div>
      )}
      <div className="a-tabs seo-filter">
        {[['', 'All'], ['auto', 'Automatic only'], ['custom', 'Custom only']].map(([v, l]) => (
          <Link key={v} href={href({ filter: v, ...(q ? { q } : {}) })} aria-current={filter === v ? 'page' : undefined}>{l}</Link>
        ))}
      </div>
      <div className="seo-list">
        {list.length ? list.map((r) => <SeoRow key={r.key} row={r} site={siteUrl()} />) : <p className="muted">No pages match.</p>}
      </div>
    </>
  );
}
