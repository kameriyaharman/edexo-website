/** Admin navigation: [href, label, icon]. Shared by the sidebar and page headers. */
export const adminNav: { title: string; items: [string, string, string][] }[] = [
  { title: 'Overview', items: [['/admin', 'Dashboard', 'home'], ['/admin/enquiries', 'Enquiries', 'contact']] },
  { title: 'Content', items: [['/admin/courses', 'Courses', 'cap'], ['/admin/languages', 'Languages', 'languages'], ['/admin/posts', 'Blog posts', 'news'], ['/admin/pages', 'Pages', 'notebook'], ['/admin/testimonials', 'Testimonials', 'quote'], ['/admin/branches', 'Centres', 'building']] },
  { title: 'Home page', items: [['/admin/settings/hero', 'Hero', 'sparkles'], ['/admin/settings/sections', 'Section headings', 'layers'], ['/admin/features', 'Feature strip', 'zap'], ['/admin/reasons', 'Why-learn reasons', 'lightbulb'], ['/admin/levels', 'Course levels', 'trophy'], ['/admin/stats', 'Stats', 'target'], ['/admin/settings/visibility', 'Show / hide sections', 'checkCircle']] },
  { title: 'Site', items: [['/admin/settings/general', 'Brand & contact', 'badge'], ['/admin/settings/header', 'Header', 'monitor'], ['/admin/menu', 'Menus', 'menu'], ['/admin/settings/enquiry', 'Enquiry form', 'send'], ['/admin/settings/footer', 'Footer', 'layers'], ['/admin/settings/seo', 'SEO & tracking', 'search'], ['/admin/redirects', 'Redirects', 'navigation'], ['/admin/account', 'Account & admins', 'shield']] },
];

export function findNav(path: string) {
  const all = adminNav.flatMap((g) => g.items.map((i) => ({ group: g.title, href: i[0], label: i[1], icon: i[2] })));
  const exact = all.find((i) => i.href === path);
  if (exact) return exact;
  return all.filter((i) => i.href !== '/admin' && path.startsWith(i.href + '/')).sort((a, b) => b.href.length - a.href.length)[0]
    ?? all[0];
}

export function iconForAdminPath(path: string) {
  return findNav(path).icon;
}
