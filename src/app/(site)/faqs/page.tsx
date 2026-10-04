import type { Metadata } from 'next';
import { PageHero } from '@/components/site/Blocks';
import { EnquiryBand } from '@/components/site/Sections';
import { FaqList } from '@/components/site/Platform';
import { JsonLd } from '@/components/site/StructuredData';
import { getFaqs } from '@/lib/data';
import { pageMeta } from '@/lib/seo';
import { Icon } from '@/components/Icon';

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({ title: 'FAQs — Courses, Fees, Online Classes & Exams', description: 'Answers to common questions about Edexo language courses, fees, online classes, exam preparation and study abroad.', path: '/faqs' });
}

export default async function FaqsPage() {
  const faqs = await getFaqs();
  const groups = [...new Set(faqs.map((f) => f.groupName || 'General'))];
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />
      <PageHero title="Frequently Asked Questions" subtitle="Courses, fees, online classes, exams and study abroad." crumbs={[{ label: 'Home', href: '/' }, { label: 'FAQs' }]} />
      <section className="section">
        <div className="wrap narrow">
          {groups.map((g) => (
            <div key={g} className="faq-group">
              <h2 className="h3"><Icon name="help" size={20} />{g}</h2>
              <FaqList schema={false} items={faqs.filter((f) => (f.groupName || 'General') === g).map((f) => ({ q: f.question, a: f.answer }))} />
            </div>
          ))}
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
