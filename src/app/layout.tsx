import type { Metadata, Viewport } from 'next';
import { getSettings, s, imageId } from '@/lib/settings';
import { canIndex } from '@/lib/seo';
import { mediaUrl } from '@/lib/format';
import './globals.css';
import './platform.css';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = { themeColor: '#0A1652', width: 'device-width', initialScale: 1 };

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
    applicationName: site,
    manifest: '/manifest.webmanifest',
    formatDetection: { telephone: true, email: true, address: true },
    robots: canIndex(st)
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
      : { index: false, follow: false },
    verification: {
      ...(s(st, 'googleVerification') ? { google: s(st, 'googleVerification') } : {}),
      ...(s(st, 'bingVerification') ? { other: { 'msvalidate.01': s(st, 'bingVerification') } } : {}),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* lets CSS know JS is on, so scroll-reveal effects never hide content when JS is off */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
