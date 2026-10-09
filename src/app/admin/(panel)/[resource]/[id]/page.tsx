import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { getResource, resources } from '@/admin/resources';
import { AdminForm, ConfirmButton } from '@/admin/Fields';
import { deleteRecord, duplicateRecord, saveRecord } from '@/admin/actions';
import { db, schema } from '@/db';
import { fmtStart } from '@/lib/batches';
import { Icon } from '@/components/Icon';
import { iconForAdminPath } from '@/admin/nav';

type Props = { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ saved?: string; copied?: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await params;
  const res = getResource(p.resource);
  return { title: res ? `${p.id === 'new' ? 'New' : 'Edit'} ${res.singular}` : 'Admin' };
}

export default async function ResourceEdit({ params, searchParams }: Props) {
  const p = await params;
  const res = getResource(p.resource);
  if (!res) notFound();
  const isNew = p.id === 'new';
  let row: Record<string, unknown> = {};
  if (!isNew) {
    const id = Number(p.id);
    if (!id) notFound();
    const [r] = await db.select().from(res.table).where(eq(res.table.id, id)).limit(1);
    if (!r) notFound();
    row = r as Record<string, unknown>;
  } else {
    // sensible defaults for new rows
    for (const f of res.fields) if (f.type === 'boolean') row[f.name] = f.name !== 'featured';
    if (res.fields.some((f) => f.name === 'rating')) row.rating = 5;
    if (res.key === 'batches') row.mode = 'Online';
  }

  // load options for selects that point at another table
  const fields = await Promise.all(res.fields.map(async (f) => {
    if (!f.optionsFrom) return { ...f, value: row[f.name] };
    const other = resources.find((r) => r.key === f.optionsFrom![0])!;
    let opts: any[] = await db.select().from(other.table).orderBy(asc(other.table.id));
    if (res.key === 'menu' && f.name === 'parentId') opts = opts.filter((o) => o.location === 'header' && !o.parentId && o.id !== row.id);
    return { ...f, value: row[f.name], resolvedOptions: opts.map((o: any) => ({ value: String(o.id), label: String(o[f.optionsFrom![1]]) })) };
  }));

  const view = !isNew && res.viewUrl ? res.viewUrl(row) : null;
  let heading = isNew ? `New ${res.singular}` : String(row.title || row.name || row.label || row.code || row.value || `Edit ${res.singular}`);
  if (res.key === 'batches' && !isNew) {
    const [c] = row.courseId ? await db.select({ title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, Number(row.courseId))).limit(1) : [];
    heading = `${String(row.title || c?.title || 'Batch')} — ${fmtStart(row.startDate as Date).full}`;
  }
  const sp = await searchParams;
  return (
    <>
      <div className="a-top">
        <div>
          <Link className="a-back" href={`/admin/${res.key}`}><Icon name="chevronLeft" size={16} />{res.label}</Link>
          <h1><span className="a-title-ic"><Icon name={iconForAdminPath(`/admin/${res.key}`)} size={22} /></span>{heading}</h1>
        </div>
        <div className="a-top-actions">
          {view && <a className="a-btn" href={view} target="_blank" rel="noopener noreferrer"><Icon name="globe" size={15} />View on site</a>}
          {!isNew && res.duplicable && (
            <form action={duplicateRecord}>
              <input type="hidden" name="__resource" value={res.key} /><input type="hidden" name="__id" value={String(row.id)} />
              <button className="a-btn" type="submit" title="Make a copy of this batch, then change the date"><Icon name="layers" size={15} />Duplicate</button>
            </form>
          )}
          {!isNew && (
            <form action={deleteRecord}>
              <input type="hidden" name="__resource" value={res.key} /><input type="hidden" name="__id" value={String(row.id)} />
              <ConfirmButton message={`Delete this ${res.singular}? This cannot be undone.`}><Icon name="close" size={15} />Delete</ConfirmButton>
            </form>
          )}
        </div>
      </div>
      {sp.copied && <p className="a-msg ok" style={{ marginBottom: 16 }}><Icon name="checkCircle" size={18} />This is a copy (hidden from the site for now). Change the start date and timing, switch on “Show on site” and save.</p>}
      <div>
        <AdminForm action={saveRecord} fields={fields}
          hidden={{ __resource: res.key, __id: isNew ? '' : String(row.id) }}
          submitLabel={isNew ? `Create ${res.singular}` : 'Save changes'}
          savedNotice={sp.saved ? 'Created.' : undefined} />
      </div>
    </>
  );
}
