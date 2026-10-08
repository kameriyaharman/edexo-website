/** Admin navigation: [href, label, icon]. Shared by the sidebar and page headers. */
export const adminNav: { title: string; items: [string, string, string][] }[] = [
  { title: 'Overview', items: [['/admin', 'Dashboard', 'home'], ['/admin/enquiries', 'Leads', 'contact'], ['/admin/payments', 'Payments', 'wallet']] },
  { title: 'Courses', items: [['/admin/languages', 'Programs', 'languages'], ['/admin/courses', 'Courses & fees', 'wallet'], ['/admin/settings/enquiry', 'Forms & page headings', 'send']] },
  { title: 'Content', items: [['/admin/pages', 'Pages', 'notebook'], ['/admin/posts', 'Blog posts', 'news'], ['/admin/faqs', 'FAQs', 'help'], ['/admin/testimonials', 'Testimonials', 'quote'], ['/admin/trainers', 'Trainers', 'users'], ['/admin/jobs', 'Job openings', 'briefcase'], ['/admin/branches', 'Centres', 'building'], ['/admin/locations', 'Locations (areas)', 'pin']] },
  { title: 'Home page', items: [['/admin/settings/hero', 'Hero', 'sparkles'], ['/admin/settings/sections', 'Section headings', 'layers'], ['/admin/features', 'Feature strip', 'zap'], ['/admin/reasons', 'Why Edexo cards', 'lightbulb'], ['/admin/stats', 'Stats', 'target'], ['/admin/levels', 'Course levels (old)', 'trophy'], ['/admin/settings/visibility', 'Show / hide sections', 'checkCircle']] },
  { title: 'Site', items: [['/admin/settings/general', 'Brand & contact', 'badge'], ['/admin/settings/header', 'Header', 'monitor'], ['/admin/menu', 'Menus', 'menu'], ['/admin/settings/footer', 'Footer', 'layers'], ['/admin/settings/seo', 'SEO', 'search'], ['/admin/settings/payments', 'Payments (Razorpay)', 'shield'], ['/admin/settings/notifications', 'Lead alerts', 'mail'], ['/admin/settings/analytics', 'Analytics & tracking', 'target'], ['/admin/redirects', 'Redirects', 'navigation'], ['/admin/account', 'Account & admins', 'shield']] },
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
