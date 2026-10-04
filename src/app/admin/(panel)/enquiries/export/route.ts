import { desc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getAdmin } from '@/lib/auth';
import { leadWhere, statusLabel, type LeadFilters } from '@/admin/leads';
import { leadId } from '@/lib/format';

const esc = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s; // avoid spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response('Unauthorized', { status: 401 });
  const url = new URL(req.url);
  const f = Object.fromEntries(url.searchParams.entries()) as LeadFilters;
  const e = schema.enquiries;
  const rows = await db.select().from(e).where(leadWhere(f)).orderBy(desc(e.createdAt));
  const extraKeys = [...new Set(rows.flatMap((r) => Object.keys((r.extra ?? {}) as object)))];
  const head = ['Lead ID', 'Date', 'Type', 'Name', 'Country', 'Phone / WhatsApp', 'Email', 'Language', 'Level', 'Course', 'Course type', 'Online/Offline',
    'Group/1-to-1', 'Exam', 'Timing', 'Time zone', 'Centre', 'Message', 'Source', 'Page', 'Status', 'Notes', ...extraKeys];
  const lines = rows.map((r) => {
    const x = (r.extra ?? {}) as Record<string, string>;
    return [
      leadId(r.id), r.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), r.type, r.name, r.country, r.phone, r.email, r.language, r.level,
      r.course, r.courseType, r.mode, r.format, r.exam, r.timing, r.timezone, r.branch, r.message, r.source, r.pageUrl, statusLabel(r.status), r.notes,
      ...extraKeys.map((k) => x[k]),
    ].map(esc).join(',');
  });
  const tab = f.tab === 'franchise' || f.tab === 'career' ? f.tab : 'enquiries';
  return new Response('﻿' + [head.join(','), ...lines].join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="edexo-${tab}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
