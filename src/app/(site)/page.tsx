import type { Metadata } from 'next';
import { getSettings, on } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';
import { OrganizationLd } from '@/components/site/StructuredData';
import { Ticker } from '@/components/site/Ticker';
import {
  AboutSection, BlogSection, BranchesSection, CoursesSection, EnquiryBand, FeaturesStrip, Hero, LevelsSection, TestimonialsSection,
} from '@/components/site/Sections';

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({ path: '/' });
}

export default async function HomePage() {
  const st = await getSettings();
  return (
    <>
      <OrganizationLd />
      <Hero />
      <Ticker />
      {on(st, 'showFeatures') && <FeaturesStrip />}
      <CoursesSection />
      <AboutSection />
      {on(st, 'showLevels') && <LevelsSection />}
      <EnquiryBand />
      <TestimonialsSection showTestimonials={on(st, 'showTestimonials')} showStats={on(st, 'showStats')} />
      {on(st, 'showBlog') && <BlogSection />}
      {on(st, 'showBranches') && <BranchesSection />}
    </>
  );
}
