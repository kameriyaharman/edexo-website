import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/Blocks';
import { EnquiryBand } from '@/components/site/Sections';
import { placeName } from '@/components/site/LocationPage';
import { getBranches, getLocations } from '@/lib/data';
import { CLUSTERS } from '@/lib/locations';
import { pageMeta } from '@/lib/seo';
import { Icon } from '@/components/Icon';

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    title: 'Areas We Serve — Language Classes across North & North-West Delhi | Edexo',
    description: 'Edexo German and foreign language classes for students in Rohini, Pitampura, Model Town, North Campus, Burari, Narela, Sonipat and more — online and at our Delhi centres.',
    path: '/areas-we-serve',
  });
}

export default async function AreasPage() {
  const [locs, branches] = await Promise.all([getLocations(), getBranches()]);
  const groups = Object.entries(CLUSTERS).map(([k, c]) => ({ key: k, label: c.label, items: locs.filter((l) => l.cluster === k) }))
    .concat([{ key: 'other', label: 'Other areas', items: locs.filter((l) => !CLUSTERS[l.cluster ?? '']) }])
    .filter((g) => g.items.length);
  return (
    <>
      <PageHero title="Areas We Serve" subtitle={`Language classes for learners across North & North-West Delhi and NCR — at our ${branches.map((b) => b.name).join(' and ')} centres or live online.`}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Areas We Serve' }]} />
      <section className="section">
        <div className="wrap area-groups">
          {groups.map((g) => (
            <div className="card area-group" key={g.key}>
              <h2 className="h3"><Icon name="pin" size={20} />{g.label}</h2>
              <div className="area-links">
                {g.items.map((l) => <Link key={l.id} href={`/${l.slug}`}><Icon name="chevronRight" size={14} />{placeName(l)}</Link>)}
              </div>
            </div>
          ))}
        </div>
      </section>
      <EnquiryBand source="Areas we serve page" />
    </>
  );
}
