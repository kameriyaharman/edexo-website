import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getCourse, getPage, getProgram } from '@/lib/data';
import { findRedirect, pageMeta } from '@/lib/seo';
import { CoursePage, LandingPage, ProgramPage } from '@/components/site/Templates';
import { PathwayPage } from '@/components/site/PathwayPage';

type Props = { params: Promise<{ path: string[] }> };

/** One URL space for pages, programs and level courses: /study-in-germany, /german-language-course, /german-a1-course. */
async function resolve(params: Props['params']) {
  const parts = (await params).path.map(decodeURIComponent);
  if (parts.length !== 1) return { parts };
  const slug = parts[0];
  const page = await getPage(slug);
  if (page) return { parts, page };
  const program = await getProgram(slug);
  if (program) return { parts, program };
  const course = await getCourse(slug);
  if (course) return { parts, course, program: course.languageSlug ? await getProgram(course.languageSlug) : null };
  return { parts };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  if ('page' in r && r.page) {
    const p = r.page;
    return pageMeta({ title: p.seoTitle || p.title, description: p.seoDescription || p.subtitle, path: `/${p.slug}`, imageId: p.imageId });
  }
  if ('course' in r && r.course) {
    const c = r.course;
    return pageMeta({
      title: c.seoTitle || `${c.title} Course — Fees & Duration`,
      description: c.seoDescription || `${c.shortDesc ?? ''} ${c.title} at Edexo — online and offline classes with a free demo.`.trim(),
      path: `/${c.slug}`, imageId: c.imageId,
    });
  }
  if ('program' in r && r.program) {
    const p = r.program;
    return pageMeta({ title: p.seoTitle || p.title || p.name, description: p.seoDescription || p.intro, path: `/${p.slug}`, imageId: p.imageId });
  }
  return {};
}

export default async function CatchAll({ params }: Props) {
  const r = await resolve(params);
  if ('page' in r && r.page) return r.page.kind === 'pathway' ? <PathwayPage p={r.page} /> : <LandingPage p={r.page} />;
  if ('course' in r && r.course) return <CoursePage c={r.course} program={r.program ?? null} />;
  if ('program' in r && r.program) return <ProgramPage p={r.program} />;
  const red = await findRedirect('/' + r.parts.join('/'));
  if (red) (red.permanent ? permanentRedirect : redirect)(red.to);
  notFound();
}
