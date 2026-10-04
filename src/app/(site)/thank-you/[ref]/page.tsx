import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { Icon, IconBubble } from '@/components/Icon';
import { getSettings, s } from '@/lib/settings';
import { getLead, parseLeadRef, payableFor, razorpayConfig } from '@/lib/payments';
import { inr, leadId, mediaUrl, waHref } from '@/lib/format';
import { PayNow } from '@/components/site/PayNow';

export const metadata: Metadata = { title: 'Thank you', robots: { index: false, follow: false } };

export default async function ThankYou({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const id = parseLeadRef(ref);
  const lead = id ? await getLead(id) : null;
  if (!lead) notFound();
  const st = await getSettings();
  const cfg = razorpayConfig(st);
  const { exact, items } = await payableFor(lead);
  const paid = await db.select().from(schema.payments).where(eq(schema.payments.enquiryId, lead.id)).orderBy(desc(schema.payments.createdAt));
  const done = paid.filter((p) => p.status === 'paid');
  const first = lead.name.split(' ')[0];
  const main = exact ? items[0] : null;
  const wa = waHref(s(st, 'whatsapp'), `Hi Edexo, my enquiry reference is ${leadId(lead.id)}${main ? ` for ${main.course.title}` : ''}.`);
  const options = items.filter((i) => i.online || i.offline).map((i) => ({
    id: i.course.id, title: i.course.title, level: i.course.level ?? '', duration: i.course.duration ?? '', online: i.online, offline: i.offline,
  }));

  return (
    <section className="section ty">
      <div className="wrap ty-wrap">
        <div className="card ty-card">
          <span className="ty-check"><Icon name="check" size={40} stroke={3} /></span>
          <h1>{s(st, 'thankYouTitle') || `Thank you, ${first}!`}</h1>
          <p className="ty-lead">{s(st, 'thankYouText') || 'Your enquiry has been received. Our team will contact you shortly on WhatsApp or phone to confirm your batch and demo class.'}</p>
          <p className="ty-ref">Reference: <strong>{leadId(lead.id)}</strong></p>

          {main && (
            <div className="ty-course">
              {main.course.imageId && <img src={mediaUrl(main.course.imageId)!} alt="" />}
              <div>
                <small>You enquired for</small>
                <h2>{main.course.title}</h2>
                <div className="ty-meta">
                  {main.course.level && <span><Icon name="layers" size={15} />{main.course.level}</span>}
                  {main.course.duration && <span><Icon name="clock" size={15} />{main.course.duration}</span>}
                  {lead.mode && <span><Icon name="laptop" size={15} />{lead.mode}</span>}
                  {lead.branch && <span><Icon name="pin" size={15} />{lead.branch}</span>}
                </div>
              </div>
            </div>
          )}
          {!main && lead.language && lead.language !== 'Not sure yet' && <p className="ty-chip"><Icon name="languages" size={16} />{lead.language}</p>}

          {done.length > 0 ? (
            <div className="ty-paid">
              <IconBubble icon="checkCircle" tone="green" size={48} iconSize={24} />
              <div>
                <strong>Payment received — {inr(done[0].amount / 100)} for {done[0].courseTitle}</strong>
                <span>{s(st, 'paidText') || 'Thank you! Our team will share your batch details shortly.'} Payment ID: {done[0].paymentId}</span>
              </div>
            </div>
          ) : cfg.enabled && options.length > 0 ? (
            <PayNow leadRef={ref} options={options} exact={!!main} defaultMode={lead.mode === 'Offline' ? 'Offline' : 'Online'}
              note={s(st, 'paymentNote')} paidText={s(st, 'paidText') || 'Thank you! Our team will share your batch details shortly.'} />
          ) : null}

          <div className="ty-actions">
            {wa && <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} />WhatsApp Us</a>}
            {s(st, 'primaryPhone') && <a className="btn btn-navy" href={`tel:${s(st, 'primaryPhone').replace(/[^\d+]/g, '')}`}><Icon name="phone" size={18} />Call {s(st, 'primaryPhone')}</a>}
            <Link className="btn btn-ghost" href={main ? `/${main.course.slug}` : '/courses'}><Icon name="arrowRight" size={16} />{main ? 'Back to course' : 'Explore courses'}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
