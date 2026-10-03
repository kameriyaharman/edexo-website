'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function NavLinks({ items }: { items: { label: string; href: string }[] }) {
  const path = usePathname();
  // close the mobile <details> menu after navigation
  useEffect(() => {
    document.querySelectorAll('details.mobile-menu[open]').forEach((d) => d.removeAttribute('open'));
  }, [path]);
  return (
    <nav className="nav" aria-label="Main">
      {items.map((m) => {
        const active = m.href === '/' ? path === '/' : path.startsWith(m.href.split('?')[0]) && m.href !== '/';
        return <Link key={m.href + m.label} href={m.href} aria-current={active ? 'page' : undefined}>{m.label}</Link>;
      })}
    </nav>
  );
}
