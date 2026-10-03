import type { Metadata } from 'next';
import { BranchCard, PageHero } from '@/components/site/Blocks';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { getBranches, getCourses } from '@/lib/data';
import { getSettings, s } from '@/lib/settings';
import { telHref } from '@/lib/format';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Contact Us', description: 'Visit Edexo in Rohini or Dwarka, Delhi, or send us a message to book a free demo class.' };

export default async function ContactPage() {
  const [st, branches, courses] = await Promise.all([getSettings(), getBranches(), getCourses()]);
  const phone = s(st, 'primaryPhone');
  const email = s(st, 'email');
  return (
    <>
      <PageHero title="Contact Us" subtitle="Book a free demo class or ask us anything — we'll call you back."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
      <section className="section">
        <div className="wrap contact-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {(phone || email) && (
              <div className="card branch">
                <div className="branch-head"><span className="branch-ic"><Icon name="headphones" size={22} /></span><h3>Talk to us</h3></div>
                {phone && <p className="b-row"><Icon name="phone" size={18} /><a href={telHref(phone)} style={{ fontWeight: 700, fontSize: 20 }}>{phone}</a></p>}
                {email && <p className="b-row"><Icon name="mail" size={18} /><a href={`mailto:${email}`}>{email}</a></p>}
              </div>
            )}
            {branches.map((b) => <BranchCard key={b.id} b={b} />)}
          </div>
          <div>
            <span className="eyebrow"><Icon name="send" size={15} />Get in touch</span><h2 className="h2" style={{ fontSize: 30, marginBottom: 20 }}>Send us a message</h2>
            <EnquiryForm className="card contact-form" source="Contact page" withMessage
              courses={courses.map((c) => c.title)} branches={branches.map((b) => b.name)}
              button="Send Message" success={s(st, 'enquirySuccess', 'Thank you! We will call you shortly.')} />
          </div>
        </div>
      </section>
    </>
  );
}
