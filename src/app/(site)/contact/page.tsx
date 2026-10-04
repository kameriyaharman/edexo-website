import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/Blocks';
import { LeadForm } from '@/components/site/LeadForms';
import { programLanguages } from '@/components/site/Sections';
import { getBranches, getLanguages } from '@/lib/data';
import { getSettings, s } from '@/lib/settings';
import { splitLines, telHref, waHref } from '@/lib/format';
import { Icon, IconBubble } from '@/components/Icon';
import { pageMeta } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const st = await getSettings();
  return pageMeta({
    title: s(st, 'contactSeoTitle', 'Contact Edexo — Rohini & Dwarka, Delhi'),
    description: s(st, 'contactSeoDescription', 'Contact Edexo to book a free demo class — WhatsApp, call, email or visit our Rohini and Dwarka centres.'),
    path: '/contact',
  });
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; language?: string }> }) {
  const sp = await searchParams;
  const [st, branches, langs] = await Promise.all([getSettings(), getBranches(), getLanguages()]);
  const type = sp.type === 'international' ? 'international' : sp.type === 'demo' ? 'demo' : 'enquiry';
  const phone = s(st, 'primaryPhone');
  const email = s(st, 'email');
  const wa = waHref(s(st, 'whatsapp'), 'Hi Edexo, I would like to know about your language courses.');
  const options = [
    wa && { icon: 'whatsapp', tone: 'green', title: 'WhatsApp', text: 'Chat with our team', href: wa, ext: true },
    phone && { icon: 'phone', tone: 'navy', title: 'Call', text: phone, href: telHref(phone) },
    email && { icon: 'mail', tone: 'blue', title: 'Email', text: email, href: `mailto:${email}` },
    { icon: 'video', tone: 'orange', title: 'Free Demo', text: 'Book a free demo class', href: '/contact?type=demo#enquiry' },
    { icon: 'globe', tone: 'amber', title: 'International Students', text: 'Enquire from outside India', href: '/contact?type=international#enquiry' },
  ].filter(Boolean) as { icon: string; tone: string; title: string; text: string; href: string; ext?: boolean }[];

  return (
    <>
      <PageHero title={s(st, 'contactTitle', 'Start Your Language Learning Journey')} subtitle={s(st, 'contactText')}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]} />
      <section className="section-sm">
        <div className="wrap contact-options">
          {options.map((o) => (
            <a key={o.title} className="card contact-opt" href={o.href} {...(o.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <IconBubble icon={o.icon} tone={o.tone} size={48} iconSize={22} />
              <span><strong>{o.title}</strong>{o.text}</span>
            </a>
          ))}
        </div>
      </section>
      <section className="section" id="enquiry" style={{ paddingTop: 24 }}>
        <div className="wrap contact-grid">
          <div>
            <span className="eyebrow"><Icon name="send" size={15} />{type === 'international' ? 'International Student Enquiry' : type === 'demo' ? 'Book a Free Demo' : 'Enquiry'}</span>
            <h2 className="h2" style={{ fontSize: 30, marginBottom: 20 }}>{type === 'international' ? 'Learn with Edexo from anywhere' : 'Tell us about your goals'}</h2>
            <LeadForm className="card contact-form lead-full" source={type === 'international' ? 'International enquiry' : type === 'demo' ? 'Contact page: demo' : 'Contact page'}
              type={type} languages={programLanguages(langs)} branches={branches.map((b) => b.name)} defaultLanguage={sp.language}
              button={type === 'international' ? 'Send International Enquiry' : type === 'demo' ? 'Book Free Demo' : 'Send Enquiry'}
              success={s(st, 'enquirySuccess', 'Thank you! We will contact you shortly.')} />
          </div>
          <div className="branch-col">
            {branches.map((b) => {
              const q = encodeURIComponent(`Edexo ${b.address}`);
              return (
                <div className="card branch" key={b.id}>
                  <div className="branch-head"><span className="branch-ic"><Icon name="building" size={22} /></span><h3>{b.name}</h3></div>
                  <p className="b-row"><Icon name="pin" size={17} /><span>{b.address}</span></p>
                  {b.landmark && <p className="b-row lm"><Icon name="navigation" size={16} /><span>{b.landmark}</span></p>}
                  <div className="phones">{splitLines(b.phones).map((ph) => <a key={ph} href={telHref(ph)}><Icon name="phone" size={15} />{ph}</a>)}</div>
                  {b.hours && <p className="b-row" style={{ marginTop: 10 }}><Icon name="clock" size={16} /><span style={{ whiteSpace: 'pre-line' }}>{b.hours}</span></p>}
                  {b.email && <p className="b-row"><Icon name="mail" size={16} /><a href={`mailto:${b.email}`}>{b.email}</a></p>}
                  <iframe className="map" title={`Map: Edexo ${b.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${q}&output=embed`} />
                  <a className="link-arrow" href={b.mapUrl || `https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer"><Icon name="navigation" size={16} />Get directions</a>
                </div>
              );
            })}
            <p className="muted small"><Icon name="globe" size={14} /> Outside India? <Link href="/international-students">See how international students join</Link>.</p>
          </div>
        </div>
      </section>
    </>
  );
}
