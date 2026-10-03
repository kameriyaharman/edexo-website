import { notFound } from 'next/navigation';
import { AdminForm } from '@/admin/Fields';
import { saveSettings } from '@/admin/actions';
import { getSettings, settingsGroups } from '@/lib/settings';

type Props = { params: Promise<{ group: string }> };

export async function generateMetadata({ params }: Props) {
  const { group } = await params;
  return { title: settingsGroups.find((g) => g.key === group)?.title ?? 'Settings' };
}

export default async function SettingsPage({ params }: Props) {
  const key = (await params).group;
  const group = settingsGroups.find((g) => g.key === key);
  if (!group) notFound();
  const st = await getSettings();
  return (
    <>
      <div className="a-top"><div><h1>{group.title}</h1>{group.description && <p>{group.description}</p>}</div>
        <div className="a-top-actions"><a className="a-btn" href="/" target="_blank" rel="noopener noreferrer">View website ↗</a></div>
      </div>
      <div className="a-card">
        <AdminForm action={saveSettings} hidden={{ __group: group.key }}
          fields={group.fields.map((f) => ({ ...f, value: st[f.name] }))} />
      </div>
    </>
  );
}
