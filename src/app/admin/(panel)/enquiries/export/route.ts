import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getAdmin } from '@/lib/auth';

const esc = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s; // avoid spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response('Unauthorized', { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? '';
  const q = (url.searchParams.get('q') ?? '').trim();
  const e = schema.enquiries;
  const rows = await db.select().from(e).where(and(
    status ? eq(e.status, status) : undefined,
    q ? or(ilike(e.name, `%${q}%`), ilike(e.phone, `%${q}%`), ilike(e.course, `%${q}%`)) : undefined,
  )).orderBy(desc(e.createdAt));
  const head = ['Date', 'Name', 'Phone', 'Email', 'Course', 'Branch', 'Message', 'Source', 'Status', 'Notes'];
  const lines = rows.map((r) => [
    r.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), r.name, r.phone, r.email, r.course, r.branch, r.message, r.source, r.status, r.notes,
  ].map(esc).join(','));
  return new Response('﻿' + [head.join(','), ...lines].join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="edexo-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
