import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, desc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getResource } from '@/admin/resources';
import { toggleActive } from '@/admin/actions';
import { formatDate, inr } from '@/lib/format';

type Props = { params: Promise<{ resource: string }>; searchParams: Promise<{ deleted?: string; location?: string }> };

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
  const langs = res.key === 'courses' ? Object.fromEntries((await db.select().from(schema.languages)).map((l) => [l.id, l.name])) : {};
  const labelOf = (name: string) => res.fields.find((f) => f.name === name)?.label.replace(/\s*\(.*\)$/, '') ?? name;

  function cell(r: any, col: string) {
    const f = res!.fields.find((x) => x.name === col);
    const v = r[col];
    if (f?.type === 'image') return v ? <img className="thumb" src={`/media/${v}`} alt="" /> : <span className="thumb" />;
    if (col === 'active' || col === 'published' || col === 'featured') {
      if (col === 'featured') return v ? 'Yes' : '—';
      return (
        <form action={toggleActive}>
          <input type="hidden" name="__resource" value={res!.key} /><input type="hidden" name="__id" value={r.id} /><input type="hidden" name="__col" value={col} />
          <button className={`pill-s ${v ? 'on' : 'off'}`} type="submit" title="Click to toggle">{v ? (col === 'active' ? 'Active' : 'Published') : 'Hidden'}</button>
        </form>
      );
    }
    if (col === 'languageId') return langs[v] ?? '—';
    if (col === 'price') return v === null ? '—' : inr(v);
    if (col === 'publishedAt') return formatDate(v);
    if (col === 'location') return f?.options?.find((o) => o.value === v)?.label ?? v;
    if (col === 'phones') return String(v ?? '').split('\n').join(', ');
    return String(v ?? '');
  }
  const titleCol = res.columns.find((c) => !res.fields.find((f) => f.name === c && f.type === 'image')) ?? 'id';

  return (
    <>
      <div className="a-top">
        <div><h1>{res.label}</h1>{res.description && <p>{res.description}</p>}</div>
        <div className="a-top-actions"><Link className="a-btn primary" href={`/admin/${res.key}/new`}>+ Add {res.singular}</Link></div>
      </div>
      {sp.deleted && <p className="a-msg ok" style={{ marginBottom: 16 }}>Deleted.</p>}
      {res.key === 'menu' && (
        <div className="a-tabs">
          {[['', 'All'], ['header', 'Header'], ['footer_useful', 'Footer column 1'], ['footer_courses', 'Footer column 2']].map(([v, l]) => (
            <Link key={v} href={v ? `/admin/menu?location=${v}` : '/admin/menu'} aria-current={(sp.location ?? '') === v ? 'page' : undefined}>{l}</Link>
          ))}
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
                    {res.viewUrl && <a className="a-btn sm" href={res.viewUrl(r) ?? '#'} target="_blank" rel="noopener noreferrer" style={{ marginRight: 6 }}>View</a>}
                    <Link className="a-btn sm" href={`/admin/${res.key}/${r.id}`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="a-card a-empty">Nothing here yet. <Link href={`/admin/${res.key}/new`}>Add the first {res.singular}</Link>.</div>}
    </>
  );
}
