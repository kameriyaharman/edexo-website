import Link from 'next/link';
import { getSettings, s, imageId } from '@/lib/settings';
import { getBranches, getMenu } from '@/lib/data';
import { mediaUrl, splitLines, telHref } from '@/lib/format';
import { Icon } from '@/components/Icon';

export async function Footer() {
  const st = await getSettings();
  const [useful, courses, branches] = await Promise.all([getMenu('footer_useful'), getMenu('footer_courses'), getBranches()]);
  const logo = mediaUrl(imageId(st, 'logoWhiteId'));
  const wa = s(st, 'whatsapp').replace(/\D/g, '');
  const socials = [
    ['Facebook', s(st, 'facebook')], ['Instagram', s(st, 'instagram')],
    ['YouTube', s(st, 'youtube')], ['LinkedIn', s(st, 'linkedin')],
    ['WhatsApp', wa ? `https://wa.me/${wa}` : ''],
  ].filter(([, u]) => u);
  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="wrap footer-grid">
        <div>
          <Link href="/" className="logo">{logo ? <img src={logo} alt={s(st, 'siteName', 'Edexo')} /> : <strong style={{ color: '#fff', fontSize: 24 }}>{s(st, 'siteName')}</strong>}</Link>
          <p className="about">{s(st, 'footerAbout')}</p>
          <div className="social">{socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer">{n}</a>)}</div>
        </div>
        <div className="col">
          <h4>{s(st, 'footerUsefulTitle', 'Useful Links')}</h4>
          {useful.map((m) => <Link key={m.id} href={m.href}>{m.label}</Link>)}
        </div>
        <div className="col">
          <h4>{s(st, 'footerCoursesTitle', 'Courses')}</h4>
          {courses.map((m) => <Link key={m.id} href={m.href}>{m.label}</Link>)}
        </div>
        <div className="col">
          <h4>{s(st, 'footerLocationsTitle', 'Our Centres')}</h4>
          {branches.map((b) => {
            const phone = splitLines(b.phones)[0];
            const map = b.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Edexo ${b.address}`)}`;
            return (
              <div className="f-loc" key={b.id}>
                <span className="f-pin"><Icon name="pin" size={16} /></span>
                <div>
                  <strong>{b.name}</strong>
                  <a href={map} target="_blank" rel="noopener noreferrer" className="f-addr">{b.address}</a>
                  {phone && <a href={telHref(phone)} className="f-phone">{phone}</a>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="wrap footer-bottom">{s(st, 'copyright').replace('{year}', String(new Date().getFullYear()))}</div>
    </footer>
  );
}
