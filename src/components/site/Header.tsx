import Link from 'next/link';
import { getSettings, s, lines, imageId } from '@/lib/settings';
import { getMenu } from '@/lib/data';
import { mediaUrl } from '@/lib/format';
import { Icon } from '@/components/Icon';
import { NavLinks } from './NavLinks';

export async function Header() {
  const st = await getSettings();
  const menu = await getMenu('header');
  const logo = mediaUrl(imageId(st, 'logoId'));
  const socials = [
    ['Facebook', s(st, 'facebook')], ['Instagram', s(st, 'instagram')],
    ['YouTube', s(st, 'youtube')], ['LinkedIn', s(st, 'linkedin')],
  ].filter(([, u]) => u);
  const wa = s(st, 'whatsapp').replace(/\D/g, '');
  const items = menu.map((m) => ({ label: m.label, href: m.href }));
  const signIn = s(st, 'signInHref');
  const cta = s(st, 'headerCtaLabel');

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <div className="topbar-items">
            {lines(st, 'topbarItems').map((t) => {
              const [k, ...rest] = t.split(':');
              return rest.length ? (
                <span key={t}><strong style={{ color: '#fff', fontWeight: 600 }}>{k}:</strong>{rest.join(':')}</span>
              ) : <span key={t}>{t}</span>;
            })}
          </div>
          <div className="topbar-social">
            {socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer">{n}</a>)}
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
        </div>
      </div>
      <header className="header">
        <div className="wrap">
          <Link href="/" className="logo" aria-label={`${s(st, 'siteName', 'Edexo')} home`}>
            {logo ? <img src={logo} alt={s(st, 'siteName', 'Edexo')} /> : <strong style={{ fontSize: 26, color: 'var(--navy-dark)' }}>{s(st, 'siteName', 'Edexo')}</strong>}
          </Link>
          <NavLinks items={items} />
          <div className="header-actions">
            {signIn && <a className="signin" href={signIn}>{s(st, 'signInLabel', 'Sign In')}</a>}
            {cta && <Link className="btn btn-orange btn-sm" href={s(st, 'headerCtaHref', '/#enroll')}>{cta}</Link>}
            <details className="mobile-menu">
              <summary aria-label="Open menu"><Icon name="menu" size={22} /></summary>
              <nav className="panel" aria-label="Mobile">
                {items.map((m) => <Link key={m.href + m.label} href={m.href}>{m.label}</Link>)}
                {signIn && <a href={signIn}>{s(st, 'signInLabel', 'Sign In')}</a>}
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
