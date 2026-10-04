'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Icon, iconFor } from '@/components/Icon';

export type NavItem = { label: string; href: string; children: { label: string; href: string; description?: string | null }[] };

const isActive = (path: string, href: string) => {
  const h = href.split(/[?#]/)[0];
  return h === '/' ? path === '/' : path === h || path.startsWith(h + '/');
};

/** Desktop navigation with hover/focus dropdowns. Long lists become a two-column mega panel. */
export function NavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname();
  useEffect(() => {
    document.querySelectorAll('details.mobile-menu[open], details.m-sub[open]').forEach((d) => d.removeAttribute('open'));
    (document.activeElement as HTMLElement | null)?.blur?.();
  }, [path]);
  return (
    <nav className="nav" aria-label="Main">
      {items.map((m) => {
        const active = isActive(path, m.href) || m.children.some((c) => isActive(path, c.href));
        if (!m.children.length) return <Link key={m.href + m.label} href={m.href} aria-current={active ? 'page' : undefined}>{m.label}</Link>;
        return (
          <div className={`nav-dd${m.children.length > 7 ? ' mega' : ''}`} key={m.href + m.label}>
            <Link href={m.href} aria-current={active ? 'page' : undefined} aria-haspopup="true">
              {m.label}<Icon name="chevronDown" size={14} stroke={2.4} />
            </Link>
            <div className="dd-panel" role="menu">
              {m.children.map((c) => (
                <Link key={c.href + c.label} href={c.href} role="menuitem" aria-current={isActive(path, c.href) ? 'page' : undefined}>
                  <span className="dd-ic"><Icon name={iconFor(c.label)} size={16} /></span>
                  <span>{c.label}{c.description && <small>{c.description}</small>}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/** Mobile drawer contents: parents expand as accordions. */
export function MobileNav({ items }: { items: NavItem[] }) {
  return (
    <>
      {items.map((m) => m.children.length ? (
        <details className="m-sub" key={m.href + m.label}>
          <summary><Icon name={iconFor(m.label)} size={18} />{m.label}<Icon name="chevronDown" size={16} /></summary>
          <div className="m-sub-list">
            {m.children.map((c) => <Link key={c.href + c.label} href={c.href}>{c.label}</Link>)}
          </div>
        </details>
      ) : (
        <Link key={m.href + m.label} href={m.href}><Icon name={iconFor(m.label)} size={18} />{m.label}</Link>
      ))}
    </>
  );
}
