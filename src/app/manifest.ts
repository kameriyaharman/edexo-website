import type { MetadataRoute } from 'next';
import { getSettings, s, imageId } from '@/lib/settings';
import { mediaUrl } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const st = await getSettings();
  const icon = mediaUrl(imageId(st, 'faviconId'));
  return {
    name: `${s(st, 'siteName', 'Edexo')} — ${s(st, 'tagline', 'German Language Institute')}`,
    short_name: s(st, 'siteName', 'Edexo'),
    start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#0A1652',
    icons: icon ? [{ src: icon, sizes: 'any', type: 'image/png' }] : [],
  };
}
