import { getSettings, imageId } from '@/lib/settings';

export const dynamic = 'force-dynamic';

// Browsers and Google request /favicon.ico directly; send them to the admin-uploaded favicon.
export async function GET() {
  const id = imageId(await getSettings(), 'faviconId');
  if (!id) return new Response('Not found', { status: 404 });
  return new Response(null, { status: 301, headers: { location: `/media/${id}`, 'cache-control': 'public, max-age=86400' } });
}
