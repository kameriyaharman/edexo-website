import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number.parseInt((await params).id, 10);
  if (!Number.isFinite(id)) return new Response('Not found', { status: 404 });
  const [m] = await db.select({ mime: schema.media.mime, data: schema.media.data }).from(schema.media).where(eq(schema.media.id, id)).limit(1);
  if (!m) return new Response('Not found', { status: 404 });
  // An image never changes under the same id (replacing an image creates a new id), so cache forever.
  return new Response(new Uint8Array(m.data), {
    headers: {
      'content-type': m.mime,
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}
