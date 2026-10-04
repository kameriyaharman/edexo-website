import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/Blocks';
import { EnrollForm, type EnrollCourse } from '@/components/site/LeadForms';
import { getBranches, getPrograms } from '@/lib/data';
import { pageMeta } from '@/lib/seo';
import { Icon } from '@/components/Icon';
import { Ticks } from '@/components/site/Platform';

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({ title: 'Enroll Now — Choose Your Course & Pay Online', description: 'Enroll in an Edexo language course: choose your language and level, online or offline, and pay securely online.', path: '/enroll' });
}

export default async function EnrollPage({ searchParams }: { searchParams: Promise<{ course?: string; program?: string }> }) {
  const { course, program } = await searchParams;
  const [programs, branches] = await Promise.all([getPrograms(), getBranches()]);
  const courses: EnrollCourse[] = programs.flatMap((p) => p.courses.map((c) => ({
    id: c.id, slug: c.slug, title: c.title, level: c.level ?? '', program: p.name, programSlug: p.slug,
    online: c.price, offline: c.priceOffline, duration: c.duration ?? '',
  })));
  return (
    <>
      <PageHero title="Enroll Now" subtitle="Choose your course, tell us about you, and confirm your seat with a secure online payment."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Courses & Fees', href: '/courses' }, { label: 'Enroll' }]} />
      <section className="section" id="enroll-form">
        <div className="wrap form-split">
          <div>
            <span className="eyebrow"><Icon name="cap" size={15} />How enrolment works</span>
            <h2 className="h2" style={{ fontSize: 30 }}>3 quick steps</h2>
            <ol className="enroll-how">
              <li><span>1</span><div><strong>Choose your course</strong>Language, level and online or offline class.</div></li>
              <li><span>2</span><div><strong>Share your details</strong>So we can send your batch details on WhatsApp.</div></li>
              <li><span>3</span><div><strong>Pay securely</strong>UPI, cards, net banking or wallets via Razorpay.</div></li>
            </ol>
            <Ticks items={['Same course fees as listed on our Courses & Fees page', 'Our team confirms your batch timing after enrolment']} />
            <p className="muted small" style={{ marginTop: 16 }}>Not sure yet? <Link href="/contact?type=demo#enquiry">Book a free demo class</Link> first.</p>
          </div>
          <EnrollForm courses={courses} defaultSlug={course} defaultProgram={program} branches={branches.map((b) => b.name)} kidsLabel="Kids batch (German / French)" />
        </div>
      </section>
    </>
  );
}
