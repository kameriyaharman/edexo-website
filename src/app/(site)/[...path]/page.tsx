import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getBranches, getCourse, getLocation, getPage, getProgram } from '@/lib/data';
import { courseFacts } from '@/lib/course-seo';
import { LocationPage, placeName } from '@/components/site/LocationPage';
import { findRedirect, pageMeta } from '@/lib/seo';
import { CoursePage, LandingPage, ProgramPage } from '@/components/site/Templates';
import { PathwayPage } from '@/components/site/PathwayPage';

type Props = { params: Promise<{ path: string[] }> };

/** One URL space for pages, programs and level courses: /study-in-germany, /german-language-course, /german-a1-course. */
async function resolve(params: Props['params']) {
  // a malformed %-escape in an old/bot URL must give a 404, never a 500
  const parts = (await params).path.map((x) => { try { return decodeURIComponent(x); } catch { return x; } });
  if (parts.length !== 1) return { parts };
  const slug = parts[0];
  const page = await getPage(slug);
  if (page) return { parts, page };
  const program = await getProgram(slug);
  if (program) return { parts, program };
  const course = await getCourse(slug);
  if (course) return { parts, course, program: course.languageSlug ? await getProgram(course.languageSlug) : null };
  const location = await getLocation(slug);
  if (location) return { parts, location };
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
    const f = courseFacts(c, r.program ?? null, (await getBranches()).map((b) => b.name));
    return pageMeta({
      title: c.seoTitle || f.seoTitle,
      description: c.seoDescription || f.seoDescription,
      path: `/${c.slug}`, imageId: c.imageId,
    });
  }
  if ('program' in r && r.program) {
    const p = r.program;
    return pageMeta({ title: p.seoTitle || p.title || p.name, description: p.seoDescription || p.intro, path: `/${p.slug}`, imageId: p.imageId });
  }
  if ('location' in r && r.location) {
    const l = r.location;
    return pageMeta({
      title: l.seoTitle || `German & Foreign Language Classes in ${placeName(l)}`,
      description: l.seoDescription || `Language classes for students in ${placeName(l)} — German A1–C2, French, Spanish, Japanese and more, online and offline.`,
      path: `/${l.slug}`, imageId: l.imageId,
    });
  }
  return {};
}

export default async function CatchAll({ params }: Props) {
  const r = await resolve(params);
  if ('page' in r && r.page) return r.page.kind === 'pathway' ? <PathwayPage p={r.page} /> : <LandingPage p={r.page} />;
  if ('course' in r && r.course) return <CoursePage c={r.course} program={r.program ?? null} />;
  if ('program' in r && r.program) return <ProgramPage p={r.program} />;
  if ('location' in r && r.location) return <LocationPage l={r.location} />;
  const red = await findRedirect('/' + r.parts.join('/'));
  if (red) (red.permanent ? permanentRedirect : redirect)(red.to);
  notFound();
}
