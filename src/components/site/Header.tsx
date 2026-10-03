import Link from 'next/link';
import { getSettings, s, lines, imageId } from '@/lib/settings';
import { getMenu } from '@/lib/data';
import { mediaUrl } from '@/lib/format';
import { Icon, iconFor } from '@/components/Icon';
import { NavLinks } from './NavLinks';

export async function Header() {
  const st = await getSettings();
  const menu = await getMenu('header');
  const logo = mediaUrl(imageId(st, 'logoId'));
  const socials = [
    ['Facebook', s(st, 'facebook'), 'facebook'], ['Instagram', s(st, 'instagram'), 'instagram'],
    ['YouTube', s(st, 'youtube'), 'youtube'], ['LinkedIn', s(st, 'linkedin'), 'linkedin'],
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
              const num = rest.join(':').trim();
              return rest.length ? (
                <a key={t} className="tb-item" href={`tel:${num.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={14} /><strong>{k}:</strong> {num}</a>
              ) : <span key={t} className="tb-item"><Icon name="info" size={14} />{t}</span>;
            })}
          </div>
          <div className="topbar-social">
            {socials.map(([n, u, ic]) => <a key={n} className="tb-social" href={u} target="_blank" rel="noopener noreferrer" aria-label={n}><Icon name={ic} size={15} /></a>)}
            {wa && <a className="tb-social" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" size={15} /></a>}
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
            {cta && <Link className="btn btn-orange btn-sm" href={s(st, 'headerCtaHref', '/#enroll')}><Icon name="cap" size={17} />{cta}</Link>}
            <details className="mobile-menu">
              <summary aria-label="Open menu"><Icon name="menu" size={22} /></summary>
              <nav className="panel" aria-label="Mobile">
                {items.map((m) => <Link key={m.href + m.label} href={m.href}><Icon name={iconFor(m.label)} size={18} />{m.label}</Link>)}
                {signIn && <a href={signIn}>{s(st, 'signInLabel', 'Sign In')}</a>}
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
