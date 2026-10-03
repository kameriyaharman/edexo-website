import { getSettings, on } from '@/lib/settings';
import {
  AboutSection, BlogSection, BranchesSection, CoursesSection, EnquiryBand, FeaturesStrip, Hero, LevelsSection, TestimonialsSection,
} from '@/components/site/Sections';

export default async function HomePage() {
  const st = await getSettings();
  return (
    <>
      <Hero />
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
