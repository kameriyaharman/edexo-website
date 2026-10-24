import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getSettings, s } from '@/lib/settings';
import { GermanRohiniPage, ROHINI_GERMAN_DEFAULTS, ROHINI_GERMAN_PATH } from '@/components/site/GermanRohiniPage';

export async function generateMetadata(): Promise<Metadata> {
  const st = await getSettings();
  return pageMeta({
    title: s(st, 'rohiniSeoTitle').trim() || ROHINI_GERMAN_DEFAULTS.title,
    description: s(st, 'rohiniSeoDescription').trim() || ROHINI_GERMAN_DEFAULTS.description,
    path: ROHINI_GERMAN_PATH,
  });
}

export default function Page() {
  return <GermanRohiniPage />;
}
