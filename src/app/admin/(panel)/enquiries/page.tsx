import Link from 'next/link';
import { and, count, desc, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/db';
import { deleteEnquiry, updateEnquiry } from '@/admin/actions';
import { ConfirmButton } from '@/admin/Fields';
import { LEAD_TABS, STATUSES, leadWhere, statusLabel, type LeadFilters } from '@/admin/leads';
import { inr, leadId } from '@/lib/format';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Leads' };
const PAGE = 30;
const FILTER_KEYS = ['tab', 'status', 'q', 'from', 'to', 'country', 'language', 'course', 'source', 'type'] as const;
const EXTRA_LABELS: Record<string, string> = {
  city: 'City', state: 'State', business: 'Current business', investment: 'Investment capacity', location: 'Preferred location',
  experience: 'Experience', position: 'Position', qualification: 'Qualification', linkedin: 'LinkedIn',
};

export default async function Enquiries({ searchParams }: { searchParams: Promise<LeadFilters & { page?: string }> }) {
  const sp = await searchParams;
  const f: LeadFilters = Object.fromEntries(FILTER_KEYS.map((k) => [k, (sp[k] ?? '').trim()]).filter(([, v]) => v));
  const tab = f.tab === 'franchise' || f.tab === 'career' ? f.tab : 'leads';
  const page = Math.max(1, Number(sp.page) || 1);
  const e = schema.enquiries;
  const where = leadWhere(f);
  const tabWhere = leadWhere({ tab });
  const [rows, [{ n }], counts, tabCounts, facets] = await Promise.all([
    db.select().from(e).where(where).orderBy(desc(e.createdAt)).limit(PAGE).offset((page - 1) * PAGE),
    db.select({ n: count() }).from(e).where(where),
    db.select({ status: e.status, n: count() }).from(e).where(leadWhere({ ...f, status: '' })).groupBy(e.status),
    db.select({ type: e.type, n: count() }).from(e).where(eq(e.status, 'new')).groupBy(e.type),
    db.selectDistinct({ country: e.country, language: e.language, source: e.source }).from(e).where(tabWhere),
  ]);
  const total = Number(n);
  const ids = rows.map((r) => r.id);
  const pays = ids.length ? await db.select().from(schema.payments).where(and(inArray(schema.payments.enquiryId, ids), eq(schema.payments.status, 'paid'))) : [];
  const cnt = Object.fromEntries(counts.map((c) => [c.status, Number(c.n)]));
  const newBy = Object.fromEntries(tabCounts.map((c) => [c.type, Number(c.n)]));
  const newIn = (t: string) => (t === 'leads' ? (newBy.enquiry ?? 0) + (newBy.international ?? 0) : newBy[t] ?? 0);
  const uniq = (k: 'country' | 'language' | 'source') => [...new Set(facets.map((x) => x[k]).filter(Boolean))].sort() as string[];
  const qs = (o: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...f, ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)])) } as Record<string, string>);
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return p.toString() ? `?${p}` : '';
  };
  const filtered = FILTER_KEYS.some((k) => k !== 'tab' && f[k]);

  return (
    <>
      <div className="a-top">
        <div><h1><span className="a-title-ic"><Icon name="contact" size={22} /></span>Leads</h1><p>Demo bookings, course and international enquiries, franchise enquiries and job applications.</p></div>
        <div className="a-top-actions"><a className="a-btn" href={`/admin/enquiries/export${qs({})}`}><Icon name="download" size={15} />Download CSV</a></div>
      </div>
      <div className="a-tabs a-tabs-lg">
        {LEAD_TABS.map(([k, label, icon]) => (
          <Link key={k} href={k === 'leads' ? '/admin/enquiries' : `/admin/enquiries?tab=${k}`} aria-current={tab === k ? 'page' : undefined}>
            <Icon name={icon} size={15} />{label}{newIn(k) > 0 && <span className="a-badge">{newIn(k)} new</span>}
          </Link>
        ))}
      </div>

      <form className="a-card a-filters">
        {tab !== 'leads' && <input type="hidden" name="tab" value={tab} />}
        <label className="a-search"><Icon name="search" size={17} /><input name="q" defaultValue={f.q} placeholder="Name, phone, email, EDX-000123…" aria-label="Search" /></label>
        <label><span>From</span><input className="a-input" type="date" name="from" defaultValue={f.from} /></label>
        <label><span>To</span><input className="a-input" type="date" name="to" defaultValue={f.to} /></label>
        <label><span>Status</span>
          <select className="a-input" name="status" defaultValue={f.status ?? ''}><option value="">All</option>{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </label>
        {tab === 'leads' && (
          <label><span>Type</span>
            <select className="a-input" name="type" defaultValue={f.type ?? ''}><option value="">All</option><option value="enquiry">India</option><option value="international">International</option></select>
          </label>
        )}
        {[['country', 'Country'], ['language', tab === 'career' ? 'Department' : 'Language'], ['source', 'Source']].map(([k, l]) => uniq(k as 'country').length > 0 && (
          <label key={k}><span>{l}</span>
            <select className="a-input" name={k} defaultValue={f[k as 'country'] ?? ''}><option value="">All</option>{uniq(k as 'country').map((v) => <option key={v}>{v}</option>)}</select>
          </label>
        ))}
        <label><span>{tab === 'career' ? 'Position' : 'Course'}</span><input className="a-input" name="course" defaultValue={f.course} placeholder="contains…" /></label>
        <div className="a-filter-actions">
          <button className="a-btn primary sm" type="submit"><Icon name="filter" size={14} />Apply</button>
          {filtered && <Link className="a-btn sm" href={tab === 'leads' ? '/admin/enquiries' : `/admin/enquiries?tab=${tab}`}>Clear</Link>}
        </div>
      </form>

      <div className="a-tabs">
        <Link href={`/admin/enquiries${qs({ status: '', page: '' })}`} aria-current={!f.status ? 'page' : undefined}>All ({Object.values(cnt).reduce((a, b) => a + b, 0)})</Link>
        {STATUSES.map(([k, l]) => (
          <Link key={k} href={`/admin/enquiries${qs({ status: k, page: '' })}`} aria-current={f.status === k ? 'page' : undefined}>{l} ({cnt[k] ?? 0})</Link>
        ))}
      </div>
      <p className="a-count-pill" style={{ marginBottom: 14 }}>{total} {total === 1 ? 'record' : 'records'}</p>

      {rows.length === 0 && <div className="a-card a-empty"><span className="a-empty-ic"><Icon name="contact" size={26} /></span>Nothing found.</div>}
      {rows.map((r) => {
        const extra = Object.entries((r.extra ?? {}) as Record<string, string>).filter(([, v]) => v);
        const digits = r.phone.replace(/\D/g, '');
        const wa = digits.length === 10 ? `91${digits}` : digits;
        return (
          <div className="a-card a-enq" key={r.id} style={{ marginBottom: 14 }}>
            <div className="who">
              <div className="a-enq-row" style={{ marginBottom: 6 }}>
                <code className="a-lead-id">{leadId(r.id)}</code>
                <strong>{r.name}</strong>
                <span className={`pill-s st-${r.status}`}>{statusLabel(r.status)}</span>
                {r.type === 'international' && <span className="pill-s intl"><Icon name="globe" size={12} />International</span>}
                {pays.filter((x) => x.enquiryId === r.id).map((x) => <span key={x.id} className="pill-s st-converted">Paid {inr(x.amount / 100)}</span>)}
              </div>
              <div className="meta-line">
                <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={14} />{r.phone}</a>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={14} />WhatsApp</a>
                {r.email && <a href={`mailto:${r.email}`}><Icon name="mail" size={14} />{r.email}</a>}
                {r.country && <span><Icon name="flag" size={14} />{r.country}</span>}
              </div>
              <div className="meta-line">
                {r.language && <span><Icon name="languages" size={14} />{r.language}</span>}
                {r.level && <span><Icon name="layers" size={14} />{r.level}</span>}
                {r.course && <span><Icon name="cap" size={14} />{r.course}</span>}
                {r.courseType && <span><Icon name="book" size={14} />{r.courseType}</span>}
                {r.mode && <span><Icon name="laptop" size={14} />{r.mode}</span>}
                {r.format && <span><Icon name="users" size={14} />{r.format}</span>}
                {r.exam && r.exam !== 'Not needed' && <span><Icon name="target" size={14} />{r.exam}</span>}
                {r.timing && <span><Icon name="calendar" size={14} />{r.timing}</span>}
                {r.timezone && r.type === 'international' && <span><Icon name="clock3" size={14} />{r.timezone}</span>}
                {r.branch && <span><Icon name="pin" size={14} />{r.branch}</span>}
              </div>
              {extra.length > 0 && (
                <dl className="a-extra">{extra.map(([k, v]) => <div key={k}><dt>{EXTRA_LABELS[k] ?? k}</dt><dd>{k === 'linkedin' ? <a href={v} target="_blank" rel="noopener noreferrer">{v}</a> : v}</dd></div>)}</dl>
              )}
              {r.fileId && <a className="a-btn sm" href={`/admin/files/${r.fileId}`} style={{ marginTop: 8 }}><Icon name="file" size={14} />Download CV</a>}
              <div className="meta-line muted">
                <span><Icon name="clock" size={14} />{r.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                {r.source && <span><Icon name="send" size={14} />{r.source}</span>}
                {r.pageUrl && <span title="Page the form was sent from"><Icon name="external" size={14} />{r.pageUrl}</span>}
              </div>
              {r.message && <p style={{ marginTop: 10, whiteSpace: 'pre-wrap', color: 'var(--a-text)', background: 'var(--a-soft)', padding: '10px 12px', borderRadius: 10 }}>{r.message}</p>}
            </div>
            <div>
              <form action={updateEnquiry}>
                <input type="hidden" name="id" value={r.id} />
                <div className="a-enq-row">
                  <select className="a-input" style={{ width: 'auto' }} name="status" defaultValue={r.status} aria-label="Status">
                    {STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <button className="a-btn sm primary" type="submit"><Icon name="check" size={14} />Update</button>
                </div>
                <textarea className="a-input" name="notes" defaultValue={r.notes ?? ''} rows={2} placeholder="Notes / follow-up (only visible to admins)" aria-label="Notes" />
              </form>
              <form action={deleteEnquiry} style={{ marginTop: 8 }}>
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton className="a-btn sm danger" message="Delete this record?"><Icon name="close" size={14} />Delete</ConfirmButton>
              </form>
            </div>
          </div>
        );
      })}
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

