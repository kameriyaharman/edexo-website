import Link from 'next/link';
import { count, desc, eq, gte } from 'drizzle-orm';
import { db, schema } from '@/db';

export const metadata = { title: 'Dashboard' };

export default async function Dashboard() {
  const since = new Date(Date.now() - 7 * 86400_000);
  const c = async (table: any, where?: any) => Number((await (where ? db.select({ n: count() }).from(table).where(where) : db.select({ n: count() }).from(table)))[0].n);
  const [newEnq, weekEnq, courses, posts, testimonials, pages] = await Promise.all([
    c(schema.enquiries, eq(schema.enquiries.status, 'new')),
    c(schema.enquiries, gte(schema.enquiries.createdAt, since)),
    c(schema.courses), c(schema.posts), c(schema.testimonials), c(schema.pages),
  ]);
  const recent = await db.select().from(schema.enquiries).orderBy(desc(schema.enquiries.createdAt)).limit(6);
  return (
    <>
      <div className="a-top"><div><h1>Dashboard</h1><p>Everything on the website is managed from here.</p></div>
        <div className="a-top-actions"><Link className="a-btn primary" href="/admin/courses/new">+ New course</Link><Link className="a-btn" href="/admin/posts/new">+ New blog post</Link></div>
      </div>
      <div className="a-grid">
        <Link className="a-stat" href="/admin/enquiries?status=new"><strong>{newEnq}</strong><span>New enquiries</span></Link>
        <Link className="a-stat" href="/admin/enquiries"><strong>{weekEnq}</strong><span>Enquiries in last 7 days</span></Link>
        <Link className="a-stat" href="/admin/courses"><strong>{courses}</strong><span>Courses</span></Link>
        <Link className="a-stat" href="/admin/posts"><strong>{posts}</strong><span>Blog posts</span></Link>
        <Link className="a-stat" href="/admin/testimonials"><strong>{testimonials}</strong><span>Testimonials</span></Link>
        <Link className="a-stat" href="/admin/pages"><strong>{pages}</strong><span>Pages</span></Link>
      </div>
      <div className="a-card" style={{ marginTop: 24 }}>
        <h2>Latest enquiries</h2>
        <p className="sub">Free demo and contact form submissions.</p>
        {recent.length ? (
          <div className="a-table-wrap" style={{ border: 0 }}>
            <table className="a-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Course</th><th>Received</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id}>
                    <td className="title">{e.name}</td><td><a href={`tel:${e.phone}`}>{e.phone}</a></td><td>{e.course}</td>
                    <td>{e.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td><span className={`pill-s st-${e.status}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="a-empty">No enquiries yet.</p>}
        <p style={{ marginTop: 14 }}><Link href="/admin/enquiries">View all enquiries →</Link></p>
      </div>
    </>
  );
}
