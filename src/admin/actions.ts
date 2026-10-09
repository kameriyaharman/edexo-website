'use server';

import bcrypt from 'bcryptjs';
import { and, eq, ne } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { createSession, destroySession, requireAdmin } from '@/lib/auth';
import { settingsGroups, type FieldDef } from '@/lib/settings';
import { slugify } from '@/lib/format';
import { getResource } from './resources';
import { saveUpload } from './media';
import { STATUS_KEYS } from './leads';
import { normalizeBlocks } from '@/lib/blocks';

export type FormState = { error?: string; ok?: string } | undefined;

/* ---------- auth ---------- */

const attempts = new Map<string, { n: number; t: number }>();

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const a = attempts.get(email);
  if (a && a.n >= 5 && Date.now() - a.t < 15 * 60_000) return { error: 'Too many attempts. Try again in 15 minutes.' };
  const [u] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email)).limit(1);
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) {
    attempts.set(email, { n: (a && Date.now() - a.t < 15 * 60_000 ? a.n : 0) + 1, t: Date.now() });
    return { error: 'Wrong email or password.' };
  }
  attempts.delete(email);
  await createSession(u.id);
  redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}

/* ---------- field parsing ---------- */

async function readField(f: FieldDef, fd: FormData): Promise<unknown> {
  const raw = fd.get(f.name);
  switch (f.type) {
    case 'boolean':
      return fd.get(f.name) === 'on';
    case 'number': {
      const v = String(raw ?? '').replace(/[,₹\s]/g, '');
      if (v === '') return null;
      const n = Number(v);
      if (!Number.isFinite(n)) throw new Error(`${f.label}: please enter a number`);
      return Math.round(n);
    }
    case 'image': {
      const file = fd.get(`${f.name}__file`);
      if (file instanceof File && file.size > 0) return saveUpload(file, String(fd.get('title') ?? fd.get('name') ?? ''));
      if (fd.get(`${f.name}__remove`) === 'on') return null;
      const keep = Number(raw);
      return Number.isFinite(keep) && keep > 0 ? keep : null;
    }
    case 'select': {
      const v = String(raw ?? '');
      if (f.name.endsWith('Id')) return v ? Number(v) : null;
      return v;
    }
    case 'blocks': {
      try { return normalizeBlocks(JSON.parse(String(raw ?? '[]'))); } catch { throw new Error(`${f.label}: could not read the sections`); }
    }
    case 'date': {
      const v = String(raw ?? '');
      return v ? new Date(v + 'T00:00:00+05:30') : new Date();
    }
    default: {
      const v = String(raw ?? '').replace(/\r\n/g, '\n');
      return f.type === 'lines' ? v.split('\n').map((l) => l.trim()).filter(Boolean).join('\n') : v.trim();
    }
  }
}

/* ---------- settings ---------- */

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const group = settingsGroups.find((g) => g.key === fd.get('__group'));
  if (!group) return { error: 'Unknown section' };
  try {
    const [row] = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);
    const data = { ...(row?.data ?? {}) } as Record<string, unknown>;
    for (const f of group.fields) {
      const v = await readField(f, fd);
      if (f.type === 'secret' && v === '' && fd.get(`${f.name}__clear`) !== 'on') continue; // keep the saved secret
      data[f.name] = v;
    }
    if (row) await db.update(schema.settings).set({ data, updatedAt: new Date() }).where(eq(schema.settings.id, 1));
    else await db.insert(schema.settings).values({ id: 1, data });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath('/', 'layout');
  return { ok: `${group.title} saved.` };
}

/* ---------- generic resources ---------- */

export async function saveRecord(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const res = getResource(String(fd.get('__resource')));
  if (!res) return { error: 'Unknown resource' };
  const id = Number(fd.get('__id')) || null;
  const values: Record<string, unknown> = {};
  try {
    for (const f of res.fields) {
      values[f.name] = await readField(f, fd);
      if (f.required && (values[f.name] === '' || values[f.name] === null)) throw new Error(`${f.label} is required`);
    }
    if ('slug' in values) {
      let slug = slugify(String(values.slug || values[res.slugFrom ?? 'title'] || ''));
      if (!slug) throw new Error('URL slug is required');
      // keep slugs unique
      const base = slug;
      for (let i = 2; ; i++) {
        const clash = await db.select({ id: res.table.id }).from(res.table)
          .where(id ? and(eq(res.table.slug, slug), ne(res.table.id, id)) : eq(res.table.slug, slug)).limit(1);
        // pages, programs and courses share the top-level URL space (/slug)
        const shared = ['pages', 'languages', 'courses', 'locations'].includes(res.key)
          ? await Promise.all([schema.pages, schema.languages, schema.courses, schema.locations].filter((t) => t !== res.table)
            .map((t) => db.select({ id: t.id }).from(t).where(eq(t.slug, slug)).limit(1)))
          : [];
        const reserved = ['admin', 'api', 'media', 'blog', 'courses', 'contact', 'about', 'faqs', 'enroll', 'areas-we-serve', 'thank-you'].includes(slug) && !(res.key === 'pages' && slug === 'about');
        if (!clash.length && !shared.some((r) => r.length) && !reserved) break;
        slug = `${base}-${i}`;
      }
      values.slug = slug;
    }
    if ('sort' in values && values.sort === null) values.sort = 0;
    if (res.key === 'redirects') {
      const norm = (v: unknown) => { const t = String(v ?? '').trim(); return /^https?:/.test(t) ? t : ('/' + t.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '')).replace(/(.)\/+$/, '$1'); };
      values.fromPath = norm(values.fromPath).split('?')[0];
      values.toPath = norm(values.toPath);
      if (values.fromPath === values.toPath) throw new Error('Old and new URL are the same');
    }
    if (res.key === 'menu' && values.parentId && Number(values.parentId) === id) values.parentId = null;
    if ('rating' in values) values.rating = Math.min(5, Math.max(1, Number(values.rating) || 5));
    if (id) {
      await db.update(res.table).set({ ...values, updatedAt: new Date() }).where(eq(res.table.id, id));
    } else {
      const [row] = await db.insert(res.table).values(values).returning({ id: res.table.id });
      revalidatePath('/', 'layout');
      redirect(`/admin/${res.key}/${row.id}?saved=1`);
    }
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw e;
    const msg = (e as Error).message;
    return { error: /duplicate key/.test(msg) ? 'That URL slug is already used' : msg };
  }
  revalidatePath('/', 'layout');
  return { ok: 'Saved.' };
}

export async function deleteRecord(fd: FormData) {
  await requireAdmin();
  const res = getResource(String(fd.get('__resource')));
  const id = Number(fd.get('__id'));
  if (!res || !id) return;
  await db.delete(res.table).where(eq(res.table.id, id));
  revalidatePath('/', 'layout');
  redirect(`/admin/${res.key}?deleted=1`);
}

/** Copy a record (e.g. last month's batch) as a hidden draft, then open it for editing. */
export async function duplicateRecord(fd: FormData) {
  await requireAdmin();
  const res = getResource(String(fd.get('__resource')));
  const id = Number(fd.get('__id'));
  if (!res?.duplicable || !id) return;
  const [row] = await db.select().from(res.table).where(eq(res.table.id, id)).limit(1);
  if (!row) return;
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = row as Record<string, unknown>;
  if ('active' in rest) rest.active = false;
  if ('startDate' in rest && rest.startDate instanceof Date) {
    // suggest the same weekday one month later, never in the past
    const d = new Date(rest.startDate);
    const now = Date.now();
    while (d.getTime() < now) d.setTime(d.getTime() + 28 * 86_400_000);
    if (d.getTime() === (rest.startDate as Date).getTime()) d.setTime(d.getTime() + 28 * 86_400_000);
    rest.startDate = d;
  }
  const [copy] = await db.insert(res.table).values(rest).returning({ id: res.table.id });
  revalidatePath('/', 'layout');
  redirect(`/admin/${res.key}/${copy.id}?copied=1`);
}

export async function toggleActive(fd: FormData) {
  await requireAdmin();
  const res = getResource(String(fd.get('__resource')));
  const id = Number(fd.get('__id'));
  const col = String(fd.get('__col'));
  if (!res || !id || !['active', 'published'].includes(col)) return;
  const [row] = await db.select().from(res.table).where(eq(res.table.id, id)).limit(1);
  if (!row) return;
  await db.update(res.table).set({ [col]: !(row as Record<string, unknown>)[col] }).where(eq(res.table.id, id));
  revalidatePath('/', 'layout');
}

/* ---------- enquiries ---------- */

export async function updateEnquiry(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  const status = String(fd.get('status') ?? 'new');
  if (!id || !STATUS_KEYS.includes(status)) return;
  await db.update(schema.enquiries).set({ status, notes: String(fd.get('notes') ?? '').slice(0, 4000), updatedAt: new Date() })
    .where(eq(schema.enquiries.id, id));
  revalidatePath('/admin/enquiries');
}

export async function deleteEnquiry(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  if (id) {
    const [row] = await db.delete(schema.enquiries).where(eq(schema.enquiries.id, id)).returning({ fileId: schema.enquiries.fileId });
    if (row?.fileId) await db.delete(schema.files).where(eq(schema.files.id, row.fileId));
  }
  revalidatePath('/admin/enquiries');
}

/* ---------- account ---------- */

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('next') ?? '');
  if (next.length < 10) return { error: 'New password must be at least 10 characters.' };
  const [u] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, me.id)).limit(1);
  if (!u || !(await bcrypt.compare(current, u.passwordHash))) return { error: 'Current password is wrong.' };
  await db.update(schema.adminUsers).set({ passwordHash: await bcrypt.hash(next, 12), updatedAt: new Date() }).where(eq(schema.adminUsers.id, me.id));
  return { ok: 'Password changed.' };
}

export async function addAdmin(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const name = String(fd.get('name') ?? '').trim();
  const password = String(fd.get('password') ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email.' };
  if (password.length < 10) return { error: 'Password must be at least 10 characters.' };
  try {
    await db.insert(schema.adminUsers).values({ email, name, passwordHash: await bcrypt.hash(password, 12) });
  } catch {
    return { error: 'An admin with that email already exists.' };
  }
  revalidatePath('/admin/account');
  return { ok: `Admin ${email} added.` };
}

export async function removeAdmin(fd: FormData) {
  const me = await requireAdmin();
  const id = Number(fd.get('id'));
  if (!id || id === me.id) return;
  await db.delete(schema.adminUsers).where(eq(schema.adminUsers.id, id));
  revalidatePath('/admin/account');
}

/* ---------- lead alerts: test ---------- */

export async function sendTestAlert(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { getSettings } = await import('@/lib/settings');
  const n = await import('@/lib/notify');
  const st = await getSettings();
  const channel = String(fd.get('channel') ?? '');
  try {
    if (channel === 'chatids') {
      const ids = await n.telegramChatIds(st);
      return ids.length ? { ok: `Found — ${ids.join(' · ')}. Copy the number(s) into "Telegram chat IDs" and save.` }
        : { error: 'No chats yet. Send /start to the bot from Telegram (or add it to a group and send a message), then try again.' };
    }
    const lead = {
      id: 0, type: 'enquiry', name: 'Test Student', phone: '+91 98765 43210', email: '', country: 'India', language: 'German',
      level: 'A1', course: 'German A1', mode: 'Online', branch: 'Rohini', message: 'This is a test alert from Admin → Lead alerts.',
      source: 'Admin test', pageUrl: '', notes: '',
    };
    if (channel === 'email') await n.sendLeadEmail(st, lead);
    else if (channel === 'whatsapp') await n.sendLeadWhatsapp(st, lead);
    else if (channel === 'telegram') await n.sendLeadTelegram(st, lead);
    else return { error: 'Unknown test' };
    return { ok: `Test ${channel === 'email' ? 'email' : channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'} sent. Check the inbox / phone.` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
