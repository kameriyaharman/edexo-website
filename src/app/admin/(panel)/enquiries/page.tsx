import Link from 'next/link';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { db, schema } from '@/db';
import { deleteEnquiry, updateEnquiry } from '@/admin/actions';
import { ConfirmButton } from '@/admin/Fields';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Enquiries' };
const STATUSES = ['new', 'contacted', 'enrolled', 'closed'] as const;
const PAGE = 30;

export default async function Enquiries({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as never) ? sp.status : '';
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const e = schema.enquiries;
  const where = and(
    status ? eq(e.status, status) : undefined,
    q ? or(ilike(e.name, `%${q}%`), ilike(e.phone, `%${q}%`), ilike(e.course, `%${q}%`), ilike(e.email, `%${q}%`)) : undefined,
  );
  const [rows, [{ n }], counts] = await Promise.all([
    db.select().from(e).where(where).orderBy(desc(e.createdAt)).limit(PAGE).offset((page - 1) * PAGE),
    db.select({ n: count() }).from(e).where(where),
    db.select({ status: e.status, n: count() }).from(e).groupBy(e.status),
  ]);
  const total = Number(n);
  const cnt = Object.fromEntries(counts.map((c) => [c.status, Number(c.n)]));
  const qs = (o: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)])) });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return p.toString() ? `?${p}` : '';
  };

  return (
    <>
      <div className="a-top">
        <div><h1><span className="a-title-ic"><Icon name="contact" size={22} /></span>Enquiries</h1><p>Leads from the free demo form and the contact page.</p></div>
        <div className="a-top-actions"><a className="a-btn" href={`/admin/enquiries/export${qs({})}`}><Icon name="certificate" size={15} />Download CSV</a></div>
      </div>
      <div className="a-tabs">
        <Link href={`/admin/enquiries${q ? `?q=${encodeURIComponent(q)}` : ''}`} aria-current={!status ? 'page' : undefined}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/enquiries?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ''}`} aria-current={status === s ? 'page' : undefined}>
            {s[0].toUpperCase() + s.slice(1)} ({cnt[s] ?? 0})
          </Link>
        ))}
      </div>
      <form className="a-toolbar">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="a-search"><Icon name="search" size={17} /><input name="q" defaultValue={q} placeholder="Search name, phone, course…" aria-label="Search enquiries" /></label>
        <span className="a-count-pill">{total} {total === 1 ? 'enquiry' : 'enquiries'}</span>
      </form>
      {rows.length === 0 && <div className="a-card a-empty"><span className="a-empty-ic"><Icon name="contact" size={26} /></span>No enquiries found.</div>}
      {rows.map((r) => (
        <div className="a-card a-enq" key={r.id} style={{ marginBottom: 14 }}>
          <div className="who">
            <div className="a-enq-row" style={{ marginBottom: 6 }}>
              <strong>{r.name}</strong><span className={`pill-s st-${r.status}`}>{r.status}</span>
            </div>
            <div className="meta-line">
              <a href={`tel:${r.phone}`}><Icon name="phone" size={14} />{r.phone}</a>
              <a href={`https://wa.me/${r.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1')}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={14} />WhatsApp</a>
              {r.email && <a href={`mailto:${r.email}`}><Icon name="mail" size={14} />{r.email}</a>}
            </div>
            <div className="meta-line">
              {r.course && <span><Icon name="cap" size={14} />{r.course}</span>}
              {r.branch && <span><Icon name="pin" size={14} />{r.branch}</span>}
              <span><Icon name="clock" size={14} />{r.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
              {r.source && <span><Icon name="send" size={14} />{r.source}</span>}
            </div>
            {r.message && <p style={{ marginTop: 10, whiteSpace: 'pre-wrap', color: 'var(--a-text)', background: 'var(--a-soft)', padding: '10px 12px', borderRadius: 10 }}>{r.message}</p>}
          </div>
          <div>
            <form action={updateEnquiry}>
              <input type="hidden" name="id" value={r.id} />
              <div className="a-enq-row">
                <select className="a-input" style={{ width: 'auto' }} name="status" defaultValue={r.status} aria-label="Status">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="a-btn sm primary" type="submit"><Icon name="check" size={14} />Update</button>
              </div>
              <textarea className="a-input" name="notes" defaultValue={r.notes ?? ''} rows={2} placeholder="Notes (only visible to admins)" aria-label="Notes" />
            </form>
            <form action={deleteEnquiry} style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={r.id} />
              <ConfirmButton className="a-btn sm danger" message="Delete this enquiry?"><Icon name="close" size={14} />Delete</ConfirmButton>
            </form>
          </div>
        </div>
      ))}
      {total > PAGE && (
        <div className="a-enq-row" style={{ justifyContent: 'center', marginTop: 10 }}>
          {page > 1 && <Link className="a-btn" href={`/admin/enquiries${qs({ page: page - 1 })}`}>← Newer</Link>}
          <span>Page {page} of {Math.ceil(total / PAGE)}</span>
          {page * PAGE < total && <Link className="a-btn" href={`/admin/enquiries${qs({ page: page + 1 })}`}>Older →</Link>}
        </div>
      )}
    </>
  );
}
