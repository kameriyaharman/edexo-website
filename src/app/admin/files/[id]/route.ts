import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getAdmin } from '@/lib/auth';

/** Private file download (CVs). Admins only; always sent as an attachment. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return new Response('Unauthorized', { status: 401 });
  const id = Number((await params).id);
  if (!id) return new Response('Not found', { status: 404 });
  const [f] = await db.select().from(schema.files).where(eq(schema.files.id, id)).limit(1);
  if (!f) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(f.data), {
    headers: {
      'content-type': f.mime, 'content-length': String(f.size),
      'content-disposition': `attachment; filename="${f.filename.replace(/"/g, '')}"`,
      'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff',
    },
  });
}
