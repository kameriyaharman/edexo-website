import type { Metadata } from 'next';
import { PageHero } from '@/components/site/Blocks';
import { CourseTabs } from '@/components/site/CourseTabs';
import { EnquiryBand } from '@/components/site/Sections';
import { getCourses, getLanguages } from '@/lib/data';
import { getSettings, s } from '@/lib/settings';

export const metadata: Metadata = { title: 'Courses', description: 'German A1 to C2, French, Italian and Japanese courses in Delhi — online and offline.' };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ language?: string }> }) {
  const { language } = await searchParams;
  const [st, langs, courses] = await Promise.all([getSettings(), getLanguages(), getCourses()]);
  return (
    <>
      <PageHero title={s(st, 'coursesTitle', 'Our Courses')} subtitle={s(st, 'coursesText')} crumbs={[{ label: 'Home', href: '/' }, { label: 'Courses' }]} />
      <section className="section">
        <div className="wrap">
          <CourseTabs initial={language} languages={langs.map((l) => ({ slug: l.slug, name: l.name }))} courses={courses} />
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
