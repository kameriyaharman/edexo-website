import { cache } from 'react';
import { and, asc, eq, gte } from 'drizzle-orm';
import { db, schema as t } from '@/db';
import { getBranches, getCourses, type CourseRow } from '@/lib/data';
import { getSettings, s } from '@/lib/settings';

const IST = 5.5 * 3600_000;
const DAY = 86_400_000;

/** Midnight (IST) today, as a Date. */
export function todayIst(now = Date.now()) {
  return new Date(Math.floor((now + IST) / DAY) * DAY - IST);
}

/** "19:00" → "7:00 PM" */
export function fmtTime(v: string | null | undefined) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(v ?? '').trim());
  if (!m) return String(v ?? '').trim();
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
}

export function fmtTiming(from?: string | null, to?: string | null) {
  const a = fmtTime(from), b = fmtTime(to);
  if (a && b) {
    // "7:00 – 8:30 PM" when both are in the same half of the day
    const [, ap] = a.split(' '), [, bp] = b.split(' ');
    return ap === bp ? `${a.replace(` ${ap}`, '')} – ${b}` : `${a} – ${b}`;
  }
  return a || b;
}

/** IST calendar parts of a stored start date. */
function parts(d: Date) {
  const x = new Date(d.getTime() + IST);
  return { day: x.getUTCDate(), month: x.getUTCMonth(), year: x.getUTCFullYear(), weekday: x.getUTCDay() };
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtStart(d: Date) {
  const p = parts(d);
  return { day: String(p.day), month: MONTHS[p.month], year: String(p.year), weekday: WEEKDAYS[p.weekday], full: `${WEEKDAYS[p.weekday]}, ${p.day} ${MONTHS[p.month]} ${p.year}`, iso: new Date(d.getTime() + IST).toISOString().slice(0, 10) };
}

export type BatchView = {
  id: number;
  course: string;
  /** linked course's own title (matches Courses & fees, used for the Thank-you page) */
  courseTitle: string | null;
  courseSlug: string | null;
  program: string | null;
  programCode: string | null;
  level: string;
  start: ReturnType<typeof fmtStart>;
  /** days until start (negative = already started) */
  inDays: number;
  days: string;
  timing: string;
  duration: string;
  mode: string;
  location: string;
  centre: string | null;
  seats: number | null;
  totalSeats: number | null;
  status: 'open' | 'low' | 'full';
  badge: string;
  note: string;
  /** one line for the enquiry form / WhatsApp */
  summary: string;
};

export const getUpcomingBatches = cache(async (): Promise<BatchView[]> => {
  const st = await getSettings();
  const keep = Math.max(0, Number(s(st, 'batchesKeepDays', '0')) || 0);
  const low = Number(s(st, 'batchesLowSeats', '5')) || 5;
  const today = todayIst();
  const from = new Date(today.getTime() - keep * DAY);
  const [rows, courses, branches] = await Promise.all([
    db.select().from(t.batches).where(and(eq(t.batches.active, true), gte(t.batches.startDate, from)))
      .orderBy(asc(t.batches.startDate), asc(t.batches.sort), asc(t.batches.id)),
    getCourses(), getBranches(),
  ]);
  const byId = new Map<number, CourseRow>(courses.map((c) => [c.id, c]));
  return rows.map((b) => {
    const c = b.courseId ? byId.get(b.courseId) ?? null : null;
    const centre = b.branchId ? branches.find((x) => x.id === b.branchId)?.name ?? null : null;
    const course = b.title?.trim() || c?.title || 'Language course';
    const timing = fmtTiming(b.timeFrom, b.timeTo);
    const location = b.location?.trim()
      || (b.mode === 'Online' ? 'Live online' : centre ? (b.mode === 'Offline' ? `${centre} centre` : `${centre} + online`) : b.mode === 'Offline' ? 'Edexo centre' : 'Live online / centre');
    const seats = b.seats ?? null;
    const status = seats === null ? 'open' : seats <= 0 ? 'full' : seats <= low ? 'low' : 'open';
    const start = fmtStart(b.startDate);
    const summary = [course, `starts ${start.full}`, b.days, timing, b.mode, b.mode !== 'Online' && centre ? centre : ''].filter(Boolean).join(' · ');
    return {
      id: b.id, course, courseTitle: c?.title ?? null, courseSlug: c?.slug ?? null, program: c?.languageName ?? null, programCode: c?.languageCode ?? null,
      level: b.level?.trim() || c?.level || '', start, inDays: Math.round((b.startDate.getTime() - today.getTime()) / DAY),
      days: b.days ?? '', timing, duration: b.duration?.trim() || c?.duration || '', mode: b.mode, location, centre,
      seats, totalSeats: b.totalSeats ?? null, status, badge: b.badge ?? '', note: b.note ?? '', summary,
    } satisfies BatchView;
  });
});

/** Batches for one course (course page) or one program (program page). */
export async function batchesFor(opts: { courseSlug?: string; program?: string }) {
  const all = await getUpcomingBatches();
  return all.filter((b) => (opts.courseSlug ? b.courseSlug === opts.courseSlug : opts.program ? b.program === opts.program : false));
}
