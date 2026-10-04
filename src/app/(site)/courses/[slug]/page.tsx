import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getCourse, getProgram } from '@/lib/data';
import { findRedirect } from '@/lib/seo';

/** Old /courses/<slug> URLs → the new top-level course and program URLs. */
export default async function OldCourseUrl({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if ((await getCourse(slug)) || (await getProgram(slug))) permanentRedirect(`/${slug}`);
  const r = await findRedirect(`/courses/${slug}`);
  if (r) (r.permanent ? permanentRedirect : redirect)(r.to);
  notFound();
}
