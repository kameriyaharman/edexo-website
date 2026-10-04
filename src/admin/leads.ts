import 'server-only';
import { and, eq, gte, ilike, lt, or, type SQL } from 'drizzle-orm';
import { schema } from '@/db';

/** Lead pipeline from the Edexo brief. */
export const STATUSES = [
  ['new', 'New'], ['contacted', 'Contacted'], ['demo_scheduled', 'Demo Scheduled'], ['demo_completed', 'Demo Completed'],
  ['follow_up', 'Follow-up'], ['converted', 'Converted'], ['not_interested', 'Not Interested'],
] as const;
export const STATUS_KEYS: string[] = STATUSES.map(([k]) => k);
export const statusLabel = (k: string) => STATUSES.find(([v]) => v === k)?.[1] ?? k;

export const LEAD_TABS = [
  ['leads', 'Enquiries', 'contact'], ['franchise', 'Franchise', 'handshake'], ['career', 'Job applications', 'briefcase'],
] as const;

export type LeadFilters = {
  tab?: string; status?: string; q?: string; from?: string; to?: string; country?: string; language?: string;
  course?: string; source?: string; type?: string;
};

const e = schema.enquiries;

/** Same filters for the list page and the CSV export. */
export function leadWhere(f: LeadFilters): SQL | undefined {
  const tab = f.tab === 'franchise' || f.tab === 'career' ? f.tab : 'leads';
  const parts: (SQL | undefined)[] = [
    tab === 'leads' ? or(eq(e.type, 'enquiry'), eq(e.type, 'international')) : eq(e.type, tab),
    f.type && tab === 'leads' && ['enquiry', 'international'].includes(f.type) ? eq(e.type, f.type) : undefined,
    f.status && STATUS_KEYS.includes(f.status) ? eq(e.status, f.status) : undefined,
    f.country ? eq(e.country, f.country) : undefined,
    f.language ? eq(e.language, f.language) : undefined,
    f.source ? eq(e.source, f.source) : undefined,
    f.course ? ilike(e.course, `%${f.course}%`) : undefined,
    f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from) ? gte(e.createdAt, new Date(`${f.from}T00:00:00+05:30`)) : undefined,
    f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to) ? lt(e.createdAt, new Date(new Date(`${f.to}T00:00:00+05:30`).getTime() + 86_400_000)) : undefined,
  ];
  const q = (f.q ?? '').trim();
  if (q) {
    const idMatch = q.match(/^(?:EDX-)?0*(\d+)$/i);
    parts.push(or(ilike(e.name, `%${q}%`), ilike(e.phone, `%${q}%`), ilike(e.email, `%${q}%`), ilike(e.course, `%${q}%`), ilike(e.message, `%${q}%`),
      ...(idMatch ? [eq(e.id, Number(idMatch[1]))] : [])));
  }
  return and(...parts);
}
