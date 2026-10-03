import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { getSettings, s, imageId } from '@/lib/settings';
import { mediaUrl } from '@/lib/format';
import './globals.css';

export const dynamic = 'force-dynamic';

const sans = localFont({
  src: [
    { path: '../fonts/pjs-400.woff2', weight: '400' },
    { path: '../fonts/pjs-500.woff2', weight: '500' },
    { path: '../fonts/pjs-600.woff2', weight: '600' },
    { path: '../fonts/pjs-700.woff2', weight: '700' },
    { path: '../fonts/pjs-800.woff2', weight: '800' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = { themeColor: '#0B1640', width: 'device-width', initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const st = await getSettings();
  const site = s(st, 'siteName', 'Edexo');
  const og = mediaUrl(imageId(st, 'ogImageId'));
  const fav = mediaUrl(imageId(st, 'faviconId'));
  const base = process.env.SITE_URL || 'http://localhost:3000';
  return {
    metadataBase: new URL(base),
    title: { default: s(st, 'seoTitle', site), template: `%s | ${site}` },
    description: s(st, 'seoDescription'),
    openGraph: { siteName: site, type: 'website', images: og ? [og] : undefined },
    icons: fav ? { icon: fav, apple: fav } : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
