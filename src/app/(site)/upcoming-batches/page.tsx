import type { Metadata } from 'next';
import { PageHero } from '@/components/site/Blocks';
import { EnquiryBand } from '@/components/site/Sections';
import { Disclaimer } from '@/components/site/Platform';
import { BatchesBoard, BatchesLd } from '@/components/site/Batches';
import { Icon } from '@/components/Icon';
import { getUpcomingBatches } from '@/lib/batches';
import { getSettings, s } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const st = await getSettings();
  return pageMeta({
    title: s(st, 'batchesSeoTitle') || 'Upcoming Batches — German & Foreign Language Classes',
    description: s(st, 'batchesSeoDescription') || 'New batch dates, days, class timings, mode and seats for German, French and other language courses at Edexo, online and at our Delhi centres. Book a free demo.',
    path: '/upcoming-batches',
  });
}

export default async function UpcomingBatchesPage() {
  const [st, batches] = await Promise.all([getSettings(), getUpcomingBatches()]);
  const open = batches.filter((b) => b.status !== 'full').length;
  const next = batches[0];
  return (
    <>
      <BatchesLd batches={batches} siteName={s(st, 'siteName', 'Edexo')} />
      <PageHero
        title={s(st, 'batchesTitle') || 'Upcoming Batches'}
        subtitle={s(st, 'batchesSubtitle') || 'Pick a start date and timing that suits you — online or at our centres. Book a free demo class before you join.'}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Courses & Fees', href: '/courses' }, { label: 'Upcoming Batches' }]}
      />
      <section className="section bt-page">
        <div className="wrap">
          {batches.length > 0 && (
            <div className="bt-summary">
              <span><Icon name="calendar" size={17} /><b>{batches.length}</b> {batches.length === 1 ? 'batch' : 'batches'} listed</span>
              <span><Icon name="users" size={17} /><b>{open}</b> open for admission</span>
              {next && <span><Icon name="clock" size={17} />Next batch: <b>{next.start.day} {next.start.month}</b></span>}
            </div>
          )}
          <BatchesBoard batches={batches} />
          <Disclaimer text={s(st, 'batchesNote') || 'Batch dates and timings may change. Our team confirms your seat and timing before the batch starts.'} />
        </div>
      </section>
      <EnquiryBand source="Upcoming batches page" title="Don't see a suitable timing?" text="Tell us your preferred days and time — we'll let you know when the next matching batch opens, or suggest one-to-one classes." />
    </>
  );
}
