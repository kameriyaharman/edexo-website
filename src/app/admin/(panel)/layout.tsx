import type { Metadata } from 'next';
import { count, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/auth';
import { getSettings, imageId } from '@/lib/settings';
import { mediaUrl } from '@/lib/format';
import { logout } from '@/admin/actions';
import { SideNav } from './SideNav';
import '../admin.css';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Edexo admin' }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const logo = mediaUrl(imageId(await getSettings(), 'logoWhiteId'));
  const [{ n }] = await db.select({ n: count() }).from(schema.enquiries).where(eq(schema.enquiries.status, 'new'));
  return (
    <div className="admin">
      <div className="a-shell">
        <aside className="a-side">
          <div className="brand">{logo ? <img src={logo} alt="Edexo" /> : 'Edexo'} <span style={{ fontWeight: 500, fontSize: 13, color: '#8C95BE' }}>Admin</span></div>
          <SideNav newEnquiries={Number(n)} />
          <div style={{ padding: '24px 12px 0', fontSize: 13 }}>
            <div style={{ color: '#8C95BE', marginBottom: 8, wordBreak: 'break-all' }}>{me.email}</div>
            <form action={logout}><button className="a-btn sm" type="submit">Sign out</button></form>
          </div>
        </aside>
        <div>
          <div className="a-mobile-nav"><SideNav newEnquiries={Number(n)} mobile /></div>
          <main className="a-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
