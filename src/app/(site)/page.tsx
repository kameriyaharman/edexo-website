import type { Metadata } from 'next';
import { getSettings, on } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';
import { OrganizationLd } from '@/components/site/StructuredData';
import { Ticker } from '@/components/site/Ticker';
import { BlogSection, BranchesSection, EnquiryBand, FeaturesStrip, Hero, LevelsSection, TestimonialsSection } from '@/components/site/Sections';
import {
  AbroadSection, ClassesSection, ExamsSection, GermanSection, HomeFaqs, InternationalSection, OnlineSection, ProgramsSection, WhySection,
} from '@/components/site/HomeSections';

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({ path: '/' });
}

/** Home page in the order given by the Edexo content brief; every block can be hidden in Admin → Settings → Visibility. */
export default async function HomePage() {
  const st = await getSettings();
  const show = (k: string) => st[k] === undefined || on(st, k);
  return (
    <>
      <OrganizationLd />
      <Hero />
      <Ticker />
      {on(st, 'showFeatures') && <FeaturesStrip />}
      {show('showPrograms') && <ProgramsSection />}
      {show('showWhy') && <WhySection />}
      {show('showGerman') && <GermanSection />}
      {show('showExams') && <ExamsSection />}
      {show('showOnline') && <OnlineSection />}
      {show('showClasses') && <ClassesSection />}
      {show('showAbroad') && <AbroadSection />}
      {show('showInternational') && <InternationalSection />}
      {on(st, 'showLevels') && <LevelsSection />}
      <TestimonialsSection showTestimonials={on(st, 'showTestimonials')} showStats={on(st, 'showStats')} />
      {show('showFaqs') && <HomeFaqs />}
      {on(st, 'showBlog') && <BlogSection />}
      <EnquiryBand />
      {on(st, 'showBranches') && <BranchesSection />}
    </>
  );
}
