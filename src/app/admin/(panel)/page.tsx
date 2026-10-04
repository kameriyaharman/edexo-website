import Link from 'next/link';
import { and, count, desc, eq, gte, or } from 'drizzle-orm';
import { statusLabel } from '@/admin/leads';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/auth';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Dashboard' };

const grads: Record<string, string> = {
  orange: 'linear-gradient(135deg,#FF9248,#EE4F0A)', navy: 'linear-gradient(135deg,#3B5BDB,#1A2E8C)',
  green: 'linear-gradient(135deg,#34D399,#12A15E)', blue: 'linear-gradient(135deg,#38BDF8,#0B8AD6)',
  amber: 'linear-gradient(135deg,#FBBF24,#E08A00)', pink: 'linear-gradient(135deg,#F472B6,#DB2777)',
};

export default async function Dashboard() {
  const me = await requireAdmin();
  const since = new Date(Date.now() - 7 * 86400_000);
  const c = async (table: any, where?: any) => Number((await (where ? db.select({ n: count() }).from(table).where(where) : db.select({ n: count() }).from(table)))[0].n);
  const [newEnq, weekEnq, courses, programs, newFr, newJobs] = await Promise.all([
    c(schema.enquiries, and(eq(schema.enquiries.status, 'new'), or(eq(schema.enquiries.type, 'enquiry'), eq(schema.enquiries.type, 'international')))),
    c(schema.enquiries, gte(schema.enquiries.createdAt, since)),
    c(schema.courses), c(schema.languages),
    c(schema.enquiries, and(eq(schema.enquiries.status, 'new'), eq(schema.enquiries.type, 'franchise'))),
    c(schema.enquiries, and(eq(schema.enquiries.status, 'new'), eq(schema.enquiries.type, 'career'))),
  ]);
  const recent = await db.select().from(schema.enquiries).orderBy(desc(schema.enquiries.createdAt)).limit(6);
  const hour = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const stats: [string, number, string, string, string][] = [
    ['/admin/enquiries?status=new', newEnq, 'New enquiries', 'contact', 'orange'],
    ['/admin/enquiries', weekEnq, 'Leads this week', 'calendar', 'navy'],
    ['/admin/enquiries?tab=franchise&status=new', newFr, 'New franchise enquiries', 'handshake', 'amber'],
    ['/admin/enquiries?tab=career&status=new', newJobs, 'New job applications', 'briefcase', 'pink'],
    ['/admin/languages', programs, 'Programs', 'languages', 'green'],
    ['/admin/courses', courses, 'Courses & fees', 'wallet', 'blue'],
  ];
  return (
    <>
      <div className="a-hero">
        <div>
          <h1>{greet}{me.name ? `, ${me.name}` : ''}</h1>
          <p>Everything on the Edexo website is managed from here.</p>
        </div>
        <div className="a-top-actions">
          <Link className="a-btn primary" href="/admin/courses/new"><Icon name="cap" size={16} />New course</Link>
          <Link className="a-btn" href="/admin/posts/new"><Icon name="news" size={16} />New blog post</Link>
        </div>
      </div>
      <div className="a-grid">
        {stats.map(([href, n, label, ic, tone]) => (
          <Link key={label} className="a-stat" href={href}>
            <span className="a-stat-ic" style={{ background: grads[tone] }}><Icon name={ic} size={22} /></span>
            <div><strong>{n}</strong><span>{label}</span></div>
          </Link>
        ))}
      </div>
      <div className="a-two">
        <div className="a-card">
          <h2><Icon name="contact" size={18} />Latest enquiries</h2>
          <p className="sub">Demo bookings, enquiries, franchise enquiries and job applications.</p>
          {recent.length ? (
            <div className="a-table-wrap" style={{ border: 0 }}>
              <table className="a-table" style={{ minWidth: 520 }}>
                <thead><tr><th>Name</th><th>Phone</th><th>Course</th><th>Status</th></tr></thead>
                <tbody>
                  {recent.map((e) => (
                    <tr key={e.id}>
                      <td className="title">{e.name}<div className="muted">{e.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</div></td>
                      <td><a href={`tel:${e.phone}`}>{e.phone}</a></td><td>{e.course}</td>
                      <td><span className={`pill-s st-${e.status}`}>{statusLabel(e.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="a-empty"><span className="a-empty-ic"><Icon name="contact" size={26} /></span>No enquiries yet.</div>}
          <p style={{ marginTop: 14 }}><Link className="a-btn sm" href="/admin/enquiries">View all enquiries<Icon name="arrowRight" size={14} /></Link></p>
        </div>
        <div className="a-card">
          <h2><Icon name="zap" size={18} />Quick edits</h2>
          <p className="sub">Jump straight to what changes most often.</p>
          <div className="a-quick">
            <Link href="/admin/settings/hero"><Icon name="sparkles" size={18} />Hero banner</Link>
            <Link href="/admin/courses"><Icon name="wallet" size={18} />Course prices</Link>
            <Link href="/admin/testimonials"><Icon name="quote" size={18} />Testimonials</Link>
            <Link href="/admin/branches"><Icon name="building" size={18} />Centres</Link>
            <Link href="/admin/settings/general"><Icon name="phone" size={18} />Phone & WhatsApp</Link>
            <Link href="/admin/settings/visibility"><Icon name="checkCircle" size={18} />Show / hide</Link>
          </div>
        </div>
      </div>
    </>
  );
}
