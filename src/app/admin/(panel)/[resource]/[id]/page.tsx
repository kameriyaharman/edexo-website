import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { getResource, resources } from '@/admin/resources';
import { AdminForm, ConfirmButton } from '@/admin/Fields';
import { deleteRecord, saveRecord } from '@/admin/actions';
import { Icon } from '@/components/Icon';
import { iconForAdminPath } from '@/admin/nav';

type Props = { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ saved?: string }> };

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
  }

  // load options for selects that point at another table
  const fields = await Promise.all(res.fields.map(async (f) => {
    if (!f.optionsFrom) return { ...f, value: row[f.name] };
    const other = resources.find((r) => r.key === f.optionsFrom![0])!;
    const opts = await db.select().from(other.table).orderBy(asc(other.table.id));
    return { ...f, value: row[f.name], resolvedOptions: opts.map((o: any) => ({ value: String(o.id), label: String(o[f.optionsFrom![1]]) })) };
  }));

  const view = !isNew && res.viewUrl ? res.viewUrl(row) : null;
  return (
    <>
      <div className="a-top">
        <div>
          <Link className="a-back" href={`/admin/${res.key}`}><Icon name="chevronLeft" size={16} />{res.label}</Link>
          <h1><span className="a-title-ic"><Icon name={iconForAdminPath(`/admin/${res.key}`)} size={22} /></span>{isNew ? `New ${res.singular}` : String(row.title ?? row.name ?? row.label ?? row.code ?? row.value ?? `Edit ${res.singular}`)}</h1>
        </div>
        <div className="a-top-actions">
          {view && <a className="a-btn" href={view} target="_blank" rel="noopener noreferrer"><Icon name="globe" size={15} />View on site</a>}
          {!isNew && (
            <form action={deleteRecord}>
              <input type="hidden" name="__resource" value={res.key} /><input type="hidden" name="__id" value={String(row.id)} />
              <ConfirmButton message={`Delete this ${res.singular}? This cannot be undone.`}><Icon name="close" size={15} />Delete</ConfirmButton>
            </form>
          )}
        </div>
      </div>
      <div>
        <AdminForm action={saveRecord} fields={fields}
          hidden={{ __resource: res.key, __id: isNew ? '' : String(row.id) }}
          submitLabel={isNew ? `Create ${res.singular}` : 'Save changes'}
          savedNotice={(await searchParams).saved ? 'Created.' : undefined} />
      </div>
    </>
  );
}
