import { getBranches } from '@/lib/data';
import { getSettings, s, imageId } from '@/lib/settings';
import { mediaUrl, splitLines } from '@/lib/format';
import { abs, siteUrl } from '@/lib/seo';

/** Renders a JSON-LD block. `<` is escaped so content can never break out of the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

function parseAddress(addr: string) {
  const pin = addr.match(/\b(\d{6})\b/)?.[1];
  return {
    '@type': 'PostalAddress',
    streetAddress: addr.replace(/,?\s*New Delhi.*$/i, '').trim(),
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    ...(pin ? { postalCode: pin } : {}),
    addressCountry: 'IN',
  };
}

/** Organisation + both centres + website search box — rendered on the home page. */
export async function OrganizationLd() {
  const [st, branches] = await Promise.all([getSettings(), getBranches()]);
  const base = siteUrl();
  const logo = mediaUrl(imageId(st, 'logoId'));
  const sameAs = ['facebook', 'instagram', 'youtube', 'linkedin'].map((k) => s(st, k)).filter((u) => /^https?:\/\//.test(u));
  const orgId = `${base}/#organization`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization', '@id': orgId, name: s(st, 'siteName', 'Edexo'), url: base + '/',
        description: s(st, 'seoDescription'), ...(logo ? { logo: abs(logo) } : {}),
        ...(s(st, 'primaryPhone') ? { telephone: s(st, 'primaryPhone') } : {}),
        ...(s(st, 'email') ? { email: s(st, 'email') } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        location: branches.map((b) => ({ '@id': `${base}/#centre-${b.id}` })),
      },
      ...branches.map((b) => ({
        '@type': ['LocalBusiness', 'EducationalOrganization'], '@id': `${base}/#centre-${b.id}`,
        name: `${s(st, 'siteName', 'Edexo')} ${b.name}`, url: base + '/contact', parentOrganization: { '@id': orgId },
        address: parseAddress(b.address), ...(splitLines(b.phones)[0] ? { telephone: splitLines(b.phones)[0] } : {}),
        ...(logo ? { image: abs(logo) } : {}), ...(b.mapUrl ? { hasMap: b.mapUrl } : {}), areaServed: 'Delhi NCR',
      })),
      { '@type': 'WebSite', '@id': `${base}/#website`, url: base + '/', name: s(st, 'siteName', 'Edexo'), publisher: { '@id': orgId }, inLanguage: 'en-IN' },
    ],
  };
  return <JsonLd data={data} />;
}

export function BreadcrumbLd({ crumbs }: { crumbs: { label: string; href?: string }[] }) {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, ...(c.href ? { item: abs(c.href) } : {}) })),
    }} />
  );
}
