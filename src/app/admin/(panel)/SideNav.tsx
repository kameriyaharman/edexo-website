'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { adminNav, findNav } from '@/admin/nav';

export function SideNav({ newEnquiries, mobile }: { newEnquiries: number; mobile?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const current = findNav(path).href;
  if (mobile) {
    return (
      <select aria-label="Admin section" value={current} onChange={(e) => router.push(e.target.value)}>
        {adminNav.map((g) => (
          <optgroup key={g.title} label={g.title}>{g.items.map(([h, l]) => <option key={h} value={h}>{l}</option>)}</optgroup>
        ))}
      </select>
    );
  }
  return (
    <nav aria-label="Admin">
      {adminNav.map((g) => (
        <div key={g.title} style={{ display: 'contents' }}>
          <div className="grp">{g.title}</div>
          {g.items.map(([h, l, ic]) => (
            <Link key={h} href={h} aria-current={current === h ? 'page' : undefined}>
              <Icon name={ic} size={18} />{l}
              {h === '/admin/enquiries' && newEnquiries > 0 && <span className="badge">{newEnquiries}</span>}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function TopCrumbs() {
  const path = usePathname();
  const n = findNav(path);
  const sub = path.endsWith('/new') ? 'New' : /\/\d+$/.test(path) ? 'Edit' : null;
  return (
    <div className="a-crumbs">
      <Icon name={n.icon} size={16} />
      <span>{n.group}</span><Icon name="chevronRight" size={14} />
      <strong style={{ color: 'var(--navy-dark)' }}>{n.label}</strong>
      {sub && <><Icon name="chevronRight" size={14} /><span>{sub}</span></>}
    </div>
  );
}
