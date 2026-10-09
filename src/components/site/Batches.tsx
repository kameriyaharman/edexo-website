import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { getSettings, on, s } from '@/lib/settings';
import { getBranches, getLanguages } from '@/lib/data';
import { batchesFor, getUpcomingBatches, type BatchView } from '@/lib/batches';
import { abs, siteUrl } from '@/lib/seo';
import { BatchBoard } from './BatchBoard';
import { programLanguages } from './Sections';
import { JsonLd } from './StructuredData';

export const KIDS_LABEL = 'Kids batch (German / French)';

/** Course + CourseInstance structured data for listed batches. */
export function batchesJsonLd(batches: BatchView[], siteName: string) {
  return {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Upcoming batches',
    itemListElement: batches.map((b, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'Course', name: b.course, description: `${b.course}${b.level ? ` (${b.level})` : ''} — new batch starting ${b.start.full}.`,
        ...(b.courseSlug ? { url: abs(`/${b.courseSlug}`) } : {}),
        provider: { '@type': 'EducationalOrganization', '@id': `${siteUrl()}/#organization`, name: siteName, sameAs: siteUrl() + '/' },
        hasCourseInstance: {
          '@type': 'CourseInstance', startDate: b.start.iso,
          courseMode: b.mode === 'Offline' ? 'Onsite' : b.mode === 'Online' ? 'Online' : 'Blended',
          ...(b.mode !== 'Online' ? { location: b.location } : {}),
          ...(b.duration ? { courseWorkload: b.duration } : {}),
        },
      },
    })),
  };
}

/** The full board (filters + rows + booking dialog) used on /upcoming-batches. */
export async function BatchesBoard({ batches, compact, source }: { batches?: BatchView[]; compact?: boolean; source?: string }) {
  const [st, langs, branches, all] = await Promise.all([getSettings(), getLanguages(), getBranches(), batches ? Promise.resolve(batches) : getUpcomingBatches()]);
  return (
    <BatchBoard
      batches={all} compact={compact}
      languages={programLanguages(langs)} branches={branches.map((b) => b.name)}
      whatsapp={s(st, 'whatsapp')} source={source ?? 'Upcoming batches'} kidsLabel={KIDS_LABEL}
      emptyText={s(st, 'batchesEmpty')}
    />
  );
}

/** "Upcoming batches" block on course and program pages — only when there is at least one batch. */
export async function BatchesStrip({ courseSlug, program, name }: { courseSlug?: string; program?: string; name: string }) {
  const st = await getSettings();
  if (!on(st, 'batchesOnCourses')) return null;
  const list = await batchesFor({ courseSlug, program });
  if (!list.length) return null;
  return (
    <section className="section bt-strip" id="batches">
      <div className="wrap">
        <div className="section-head bt-strip-head">
          <span className="eyebrow"><Icon name="calendar" size={15} />New batches</span>
          <h2 className="h2">Upcoming {name} Batches</h2>
        </div>
        <BatchesBoard batches={list} compact source={`Batches: ${name}`} />
        <p className="bt-more"><Link className="link-arrow" href="/upcoming-batches">See all upcoming batches<Icon name="arrowRight" size={15} /></Link></p>
      </div>
    </section>
  );
}

export function BatchesLd({ batches, siteName }: { batches: BatchView[]; siteName: string }) {
  return batches.length ? <JsonLd data={batchesJsonLd(batches, siteName)} /> : null;
}
