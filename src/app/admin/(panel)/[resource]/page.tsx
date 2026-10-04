import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, desc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getResource } from '@/admin/resources';
import { toggleActive } from '@/admin/actions';
import { formatDate, inr } from '@/lib/format';
import { Icon } from '@/components/Icon';
import { iconForAdminPath } from '@/admin/nav';

type Props = { params: Promise<{ resource: string }>; searchParams: Promise<{ deleted?: string; location?: string; q?: string; program?: string }> };

export async function generateMetadata({ params }: Props) {
  return { title: getResource((await params).resource)?.label ?? 'Admin' };
}

export default async function ResourceList({ params, searchParams }: Props) {
  const res = getResource((await params).resource);
  if (!res) notFound();
  const sp = await searchParams;
  const t = res.table;
  const order = res.orderBy === 'sort' ? [asc(t.sort), asc(t.id)] : res.orderBy === 'publishedAt' ? [desc(t.publishedAt), desc(t.id)] : [asc(t.id)];
  let rows: any[] = await db.select().from(t).orderBy(...order);
  if (res.key === 'menu' && sp.location) rows = rows.filter((r) => r.location === sp.location);
  if (res.key === 'menu') {
    // children directly under their parent
    const top = rows.filter((r) => !r.parentId || !rows.some((p) => p.id === r.parentId));
    rows = top.flatMap((p) => [p, ...rows.filter((c) => c.parentId === p.id)]);
  }
  const total = rows.length;
  const q = (sp.q ?? '').trim().toLowerCase();
  if (q) rows = rows.filter((r) => res.fields.some((f) => ['text', 'textarea'].includes(f.type) && String(r[f.name] ?? '').toLowerCase().includes(q)));
  const icon = iconForAdminPath(`/admin/${res.key}`);
  const langs = ['courses', 'posts'].includes(res.key) ? Object.fromEntries((await db.select().from(schema.languages)).map((l) => [l.id, l.name])) : {};
  const menuLabels = res.key === 'menu' ? Object.fromEntries((await db.select().from(schema.menuItems)).map((m) => [m.id, m.label])) : {};
  const langFilter = sp.program;
  if (res.key === 'courses' && langFilter) rows = rows.filter((r) => String(r.languageId) === langFilter);
  const labelOf = (name: string) => res.fields.find((f) => f.name === name)?.label.replace(/\s*\(.*\)$/, '') ?? name;

  function cell(r: any, col: string) {
    const f = res!.fields.find((x) => x.name === col);
    const v = r[col];
    if (f?.type === 'image') return v ? <img className="thumb" src={`/media/${v}`} alt="" /> : <span className="thumb" />;
    if (col === 'showOnHome') return v ? <span className="pill-s on">Home</span> : '—';
    if (col === 'parentId') return v ? <span className="muted">↳ {menuLabels[v] ?? '—'}</span> : '—';
    if (col === 'priceOffline') return v === null ? '—' : inr(v);
    if (col === 'kind') return <span className="pill-s">{String(v)}</span>;
    if (col === 'active' || col === 'published' || col === 'featured') {
      if (col === 'featured') return v ? 'Yes' : '—';
      return (
        <form action={toggleActive}>
          <input type="hidden" name="__resource" value={res!.key} /><input type="hidden" name="__id" value={r.id} /><input type="hidden" name="__col" value={col} />
          <button className={`pill-s ${v ? 'on' : 'off'}`} type="submit" title="Click to toggle">{v ? (col === 'active' ? (res!.key === 'jobs' ? 'Open' : 'Active') : 'Published') : 'Hidden'}</button>
        </form>
      );
    }
    if (col === 'languageId') return langs[v] ?? '—';
    if (col === 'price') return v === null ? '—' : inr(v);
    if (col === 'publishedAt') return formatDate(v);
    if (col === 'location') return f?.options?.find((o) => o.value === v)?.label ?? v;
    if (col === 'phones') return String(v ?? '').split('\n').join(', ');
    if (col === 'hits') return <span className="muted" style={{ whiteSpace: 'nowrap' }}>{v ?? 0} {Number(v) === 1 ? 'visit' : 'visits'}</span>;
    return String(v ?? '');
  }
  const titleCol = res.columns.find((c) => !res.fields.find((f) => f.name === c && f.type === 'image')) ?? 'id';

  return (
    <>
      <div className="a-top">
        <div><h1><span className="a-title-ic"><Icon name={icon} size={22} /></span>{res.label}</h1>{res.description && <p>{res.description}</p>}</div>
        <div className="a-top-actions"><Link className="a-btn primary" href={`/admin/${res.key}/new`}><Icon name="sparkles" size={16} />Add {res.singular}</Link></div>
      </div>
      {sp.deleted && <p className="a-msg ok" style={{ marginBottom: 16 }}><Icon name="checkCircle" size={18} />Deleted.</p>}
      <form className="a-toolbar">
        {sp.location && <input type="hidden" name="location" value={sp.location} />}
        <label className="a-search"><Icon name="search" size={17} /><input name="q" defaultValue={sp.q ?? ''} placeholder={`Search ${res.label.toLowerCase()}…`} aria-label={`Search ${res.label}`} /></label>
        <span className="a-count-pill">{q ? `${rows.length} of ${total}` : `${total} ${total === 1 ? res.singular : res.label.toLowerCase()}`}</span>
      </form>
      {res.key === 'menu' && (
        <div className="a-tabs">
          {[['', 'All'], ['header', 'Header'], ['footer_useful', 'Quick Links'], ['footer_courses', 'Popular Programs'], ['footer_support', 'Support']].map(([v, l]) => (
            <Link key={v} href={v ? `/admin/menu?location=${v}` : '/admin/menu'} aria-current={(sp.location ?? '') === v ? 'page' : undefined}>{l}</Link>
          ))}
        </div>
      )}
      {res.key === 'courses' && (
        <div className="a-tabs">
          <Link href="/admin/courses" aria-current={!sp.program ? 'page' : undefined}>All</Link>
          {Object.entries(langs).map(([id, name]) => <Link key={id} href={`/admin/courses?program=${id}`} aria-current={sp.program === id ? 'page' : undefined}>{name}</Link>)}
        </div>
      )}
      {rows.length ? (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr>{res.columns.map((c) => <th key={c}>{res.fields.find((f) => f.name === c)?.type === 'image' ? '' : labelOf(c)}</th>)}<th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {res.columns.map((c) => (
                    <td key={c} className={c === titleCol ? 'title' : undefined}>
                      {c === titleCol ? <Link href={`/admin/${res.key}/${r.id}`}>{cell(r, c) || '(untitled)'}</Link> : cell(r, c)}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div className="a-row-actions">
                      {res.viewUrl && <a className="a-btn sm" href={res.viewUrl(r) ?? '#'} target="_blank" rel="noopener noreferrer" aria-label="View on site"><Icon name="globe" size={14} />View</a>}
                      <Link className="a-btn sm navy" href={`/admin/${res.key}/${r.id}`}><Icon name="pen" size={14} />Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="a-card a-empty">
          <span className="a-empty-ic"><Icon name={q ? 'search' : icon} size={26} /></span>
          {q ? <>Nothing matches “{sp.q}”.</> : <>Nothing here yet.</>}
          <Link className="a-btn primary" href={`/admin/${res.key}/new`}><Icon name="sparkles" size={16} />Add {res.singular}</Link>
        </div>
      )}
    </>
  );
}
