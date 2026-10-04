import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getSettings, s } from '@/lib/settings';
import { getProgram } from '@/lib/data';
import { pageMeta } from '@/lib/seo';
import { FeesPage } from '@/components/site/Templates';

export async function generateMetadata(): Promise<Metadata> {
  const st = await getSettings();
  return pageMeta({
    title: s(st, 'coursesSeoTitle', 'Courses & Fees'),
    description: s(st, 'coursesSeoDescription', 'Course fees for every Edexo language program — online and offline.'),
    path: '/courses',
  });
}

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ language?: string }> }) {
  const { language } = await searchParams;
  if (language) {
    const p = await getProgram(language) ?? await getProgram(`${language}-language-course`);
    if (p) permanentRedirect(`/${p.slug}`);
  }
  return <FeesPage />;
}
