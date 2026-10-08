import { notFound } from 'next/navigation';
import { AdminForm } from '@/admin/Fields';
import { saveSettings } from '@/admin/actions';
import { getSettings, settingsGroups } from '@/lib/settings';
import { Icon } from '@/components/Icon';
import { iconForAdminPath } from '@/admin/nav';
import { TestAlert } from '@/admin/TestAlert';

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
      <div className="a-top">
        <div><h1><span className="a-title-ic"><Icon name={iconForAdminPath(`/admin/settings/${group.key}`)} size={22} /></span>{group.title}</h1>{group.description && <p>{group.description}</p>}</div>
        <div className="a-top-actions"><a className="a-btn" href="/" target="_blank" rel="noopener noreferrer"><Icon name="globe" size={15} />View website</a></div>
      </div>
      <AdminForm action={saveSettings} hidden={{ __group: group.key }} layout={group.fields.some((f) => f.type === 'image') ? 'split' : 'single'}
        fields={group.fields.map((f) => ({ ...f, value: f.type === 'secret' ? (st[f.name] ? 'set' : '') : st[f.name] }))} />
      {group.key === 'notifications' && <TestAlert />}
    </>
  );
}
