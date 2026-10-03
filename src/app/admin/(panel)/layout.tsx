import type { Metadata } from 'next';
import { count, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/auth';
import { getSettings, imageId } from '@/lib/settings';
import { mediaUrl } from '@/lib/format';
import { logout } from '@/admin/actions';
import { Icon } from '@/components/Icon';
import { SideNav, TopCrumbs } from './SideNav';
import '../admin.css';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Edexo admin' }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const logo = mediaUrl(imageId(await getSettings(), 'logoWhiteId'));
  const [{ n }] = await db.select({ n: count() }).from(schema.enquiries).where(eq(schema.enquiries.status, 'new'));
  const initial = (me.name || me.email).trim()[0]?.toUpperCase() ?? 'A';
  return (
    <div className="admin">
      <div className="a-shell">
        <aside className="a-side">
          <div className="brand">{logo ? <img src={logo} alt="Edexo" /> : 'Edexo'} <small>Admin</small></div>
          <SideNav newEnquiries={Number(n)} />
          <div className="a-side-foot">
            <span className="a-avatar">{initial}</span>
            <div className="who"><strong>{me.name || 'Admin'}</strong><span>{me.email}</span></div>
            <form action={logout}><button className="a-iconbtn" type="submit" aria-label="Sign out" title="Sign out"><Icon name="arrowRight" size={17} /></button></form>
          </div>
        </aside>
        <div>
          <div className="a-mobile-nav">
            <SideNav newEnquiries={Number(n)} mobile />
            <form action={logout}><button className="a-iconbtn" type="submit" aria-label="Sign out"><Icon name="arrowRight" size={17} /></button></form>
          </div>
          <div className="a-topbar">
            <div className="a-topbar-in">
              <TopCrumbs />
              <div className="a-top-right">
                <a className="a-btn sm" href="/" target="_blank" rel="noopener noreferrer"><Icon name="globe" size={15} />View website</a>
              </div>
            </div>
          </div>
          <main className="a-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
