'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const groups: { title: string; items: [string, string][] }[] = [
  { title: 'Overview', items: [['/admin', 'Dashboard'], ['/admin/enquiries', 'Enquiries']] },
  { title: 'Content', items: [['/admin/courses', 'Courses'], ['/admin/languages', 'Languages'], ['/admin/posts', 'Blog posts'], ['/admin/pages', 'Pages'], ['/admin/testimonials', 'Testimonials'], ['/admin/branches', 'Centres']] },
  { title: 'Home page', items: [['/admin/settings/hero', 'Hero'], ['/admin/settings/sections', 'Section headings'], ['/admin/features', 'Feature strip'], ['/admin/reasons', 'Why-learn reasons'], ['/admin/levels', 'Course levels'], ['/admin/stats', 'Stats'], ['/admin/settings/visibility', 'Show / hide sections']] },
  { title: 'Site', items: [['/admin/settings/general', 'Brand & contact'], ['/admin/settings/header', 'Header'], ['/admin/menu', 'Menus'], ['/admin/settings/enquiry', 'Enquiry form'], ['/admin/settings/footer', 'Footer'], ['/admin/settings/seo', 'SEO & tracking'], ['/admin/account', 'Account & admins']] },
];

export function SideNav({ newEnquiries, mobile }: { newEnquiries: number; mobile?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const isActive = (href: string) => (href === '/admin' ? path === '/admin' : path === href || path.startsWith(href + '/'));
  if (mobile) {
    const current = groups.flatMap((g) => g.items).find(([h]) => isActive(h))?.[0] ?? '/admin';
    return (
      <select aria-label="Admin section" value={current} onChange={(e) => router.push(e.target.value)}>
        {groups.map((g) => (
          <optgroup key={g.title} label={g.title}>{g.items.map(([h, l]) => <option key={h} value={h}>{l}</option>)}</optgroup>
        ))}
        <option value="/">View website</option>
      </select>
    );
  }
  return (
    <nav aria-label="Admin">
      {groups.map((g) => (
        <div key={g.title} style={{ display: 'contents' }}>
          <div className="grp">{g.title}</div>
          {g.items.map(([h, l]) => (
            <Link key={h} href={h} aria-current={isActive(h) ? 'page' : undefined}>
              {l}{h === '/admin/enquiries' && newEnquiries > 0 && <span className="badge">{newEnquiries}</span>}
            </Link>
          ))}
        </div>
      ))}
      <div className="grp">Website</div>
      <a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
    </nav>
  );
}
