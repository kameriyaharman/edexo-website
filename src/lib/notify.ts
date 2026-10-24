import 'server-only';
import { getSettings, s, type Settings } from '@/lib/settings';
import { leadId } from '@/lib/format';
import { siteUrl } from '@/lib/seo';
import { leadRef } from '@/lib/payments';
import { EMAIL_DEFAULTS } from '@/lib/email-defaults';
export { EMAIL_DEFAULTS };

/**
 * New-lead alerts to the institute — free services only:
 * email (Brevo / Resend free plans, HTTP API because Railway Hobby blocks SMTP),
 * WhatsApp (CallMeBot, free, to the owner's own number) and Telegram (free bot).
 * Never throws: a failed alert must never lose or block the enquiry, which is already saved.
 */

export type LeadForAlert = {
  id: number; type: string; name: string; phone: string; email?: string | null; country?: string | null;
  language?: string | null; level?: string | null; course?: string | null; courseType?: string | null;
  mode?: string | null; format?: string | null; exam?: string | null; timing?: string | null; timezone?: string | null;
  branch?: string | null; message?: string | null; source?: string | null; pageUrl?: string | null;
  extra?: Record<string, string> | null; notes?: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  enquiry: 'Enquiry / demo', international: 'International enquiry', franchise: 'Franchise enquiry',
  ausbildung: 'Ausbildung eligibility', study: 'Study in Germany', career: 'Job application',
};
const TAB: Record<string, string> = { franchise: 'franchise', career: 'career', ausbildung: 'ausbildung', study: 'study' };

const list = (v: string) => v.split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean);
const digits = (v: string) => v.replace(/\D/g, '');
const flag = (st: Settings, k: string) => st[k] === true || st[k] === 'true';

function leadUrl(l: LeadForAlert) {
  const q = new URLSearchParams({ q: leadId(l.id) });
  if (TAB[l.type]) q.set('tab', TAB[l.type]);
  return `${siteUrl()}/admin/enquiries?${q}`;
}

function rows(l: LeadForAlert): [string, string][] {
  const r: [string, string][] = [
    ['Lead ID', leadId(l.id)], ['Type', TYPE_LABEL[l.type] ?? l.type], ['Name', l.name], ['Phone / WhatsApp', l.phone],
    ['Email', l.email ?? ''], ['Country', l.country ?? ''], ['Language', l.language ?? ''], ['Level', l.level ?? ''],
    [l.type === 'career' ? 'Position' : 'Course', l.course ?? ''], ['Course type', l.courseType ?? ''], ['Mode', l.mode ?? ''],
    ['Batch', l.format ?? ''], ['Exam', l.exam ?? ''], ['Preferred timing', l.timing ?? ''], ['Time zone', l.timezone ?? ''],
    ['Centre', l.branch ?? ''],
  ];
  for (const [k, v] of Object.entries(l.extra ?? {})) r.push([k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), v]);
  r.push(['Message', l.message ?? ''], ['Source', l.source ?? ''], ['Page', l.pageUrl ?? ''], ['Note', l.notes ?? '']);
  return r.filter(([, v]) => String(v ?? '').trim());
}

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/* ---------- email templates (editable in Admin → Lead alerts) ---------- */


const tpl = (st: Settings, k: keyof typeof EMAIL_DEFAULTS) => s(st, k).trim() || EMAIL_DEFAULTS[k];
const isSpam = (l: LeadForAlert) => !!l.notes?.startsWith('Possible spam');

type Vars = Record<string, string>;

function leadVars(st: Settings, l: LeadForAlert, more: Vars = {}): Vars {
  const r = Object.fromEntries(rows(l));
  const thankYou = l.id && !['franchise', 'ausbildung', 'study', 'career'].includes(l.type) ? `${siteUrl()}/thank-you/${leadRef(l.id)}` : siteUrl();
  return {
    site: s(st, 'siteName', 'Edexo'), sitePhone: s(st, 'primaryPhone'), siteEmail: s(st, 'email', 'info@edexo.in'), siteUrl: siteUrl(),
    leadId: leadId(l.id), type: TYPE_LABEL[l.type] ?? 'enquiry', name: l.name, firstName: l.name.trim().split(/\s+/)[0] || l.name,
    phone: l.phone, email: l.email ?? '', country: l.country ?? '', language: l.language ?? '', level: l.level ?? '',
    course: l.course || l.language || TYPE_LABEL[l.type] || 'your course', mode: l.mode ?? '', centre: l.branch ?? '',
    batch: r['Batch'] ?? l.format ?? '', timing: l.timing ?? '', message: l.message ?? '', source: l.source ?? '',
    adminLink: leadUrl(l), thankYouLink: thankYou, date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    ...more,
  };
}

/** Plain-text fill: {{name}} → value. Unknown placeholders become empty. */
const fill = (t: string, v: Vars) => t.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (k === 'details' ? '\u0000details\u0000' : v[k] ?? ''));

function detailsTable(l: LeadForAlert) {
  return `<table style="border-collapse:collapse;width:100%;font-size:14px;margin:4px 0 16px">${rows(l).map(([k, v]) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #ECEEF4;color:#4F566B;white-space:nowrap;vertical-align:top">${esc(k)}</td>` +
    `<td style="padding:8px 12px;border-bottom:1px solid #ECEEF4;color:#0B1640;white-space:pre-wrap">${esc(String(v))}</td></tr>`).join('')}</table>`;
}

const btn = (href: string, label: string, bg: string) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 16px;border-radius:8px;background:${bg};color:#fff;text-decoration:none;font-weight:600">${esc(label)}</a>`;

/** Template text → HTML: blank line = new paragraph, [Label](url) on its own line = button, {{details}} = lead table. */
function bodyHtml(text: string, v: Vars, l: LeadForAlert | null, accent: string) {
  const para = (raw: string) => {
    const p = raw.trim();
    if (!p) return '';
    return p.split('\n').map((line) => {
      const ln = line.trim();
      if (/^(\[[^\]]+\]\([^)\s]+\)\s*)+$/.test(ln)) // a line with only links → buttons
        return `<p style="margin:0 0 14px">${[...ln.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => btn(m[2], m[1], accent)).join('')}</p>`;
      return `<p style="margin:0 0 ${line === p.split('\n').at(-1) ? 14 : 2}px;line-height:1.55">${esc(line).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, `<a href="$2" style="color:${accent}">$1</a>`) || '&nbsp;'}</p>`;
    }).join('');
  };
  return fill(text, v).split('\u0000details\u0000').map((chunk) => chunk.split(/\n{2,}/).map(para).join(''))
    .join(l ? detailsTable(l) : '');
}

function bodyText(text: string, v: Vars, l: LeadForAlert | null) {
  const details = l ? rows(l).map(([k, val]) => `${k}: ${val}`).join('\n') : '';
  return fill(text, v).replace(/\u0000details\u0000/g, details).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1: $2');
}

function layout(st: Settings, heading: string, inner: string, footer: string) {
  const color = s(st, 'emailBrandColor').trim() || '#1B2A6B';
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0B1640;font-size:15px">
<div style="background:${esc(color)};color:#fff;padding:16px 20px;border-radius:10px 10px 0 0;font-size:18px;font-weight:700">${esc(heading)}</div>
<div style="border:1px solid #ECEEF4;border-top:0;border-radius:0 0 10px 10px;padding:18px 20px">${inner}
${footer ? `<p style="color:#4F566B;font-size:12px;margin:18px 0 0;white-space:pre-wrap">${esc(footer)}</p>` : ''}
</div></div>`;
}

/** "Edexo Website <website@edexo.in>" → { name, email } */
function parseFrom(v: string) {
  const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(v);
  return m ? { name: m[1].replace(/^"|"$/g, '') || undefined, email: m[2].trim() } : { name: undefined, email: v.trim() };
}

async function post(url: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(url, {
    method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', ...headers },
    body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`${res.status} ${t.slice(0, 300)}`);
  }
}

/** Send one email through the chosen free HTTP API (Resend or Brevo). */
export async function sendMail(st: Settings, m: { to: string[]; subject: string; html: string; text: string; replyTo?: { email: string; name?: string } }) {
  const key = (s(st, 'emailApiKey').trim() || process.env.RESEND_API_KEY || process.env.BREVO_API_KEY || '').trim();
  const provider = s(st, 'emailProvider').trim() || (key.startsWith('xkeysib-') ? 'brevo' : 'resend');
  const from = parseFrom(s(st, 'emailFrom') || `${s(st, 'siteName', 'Edexo')} <${s(st, 'email', 'info@edexo.in')}>`);
  if (!m.to.length) throw new Error('No "send to" email address set.');
  if (!key) throw new Error('Email API key is not set (Admin → Lead alerts → Email service API key).');
  if (provider === 'resend') {
    await post('https://api.resend.com/emails', { authorization: `Bearer ${key}` }, {
      from: from.name ? `${from.name} <${from.email}>` : from.email, to: m.to, subject: m.subject, html: m.html, text: m.text,
      ...(m.replyTo ? { reply_to: m.replyTo.email } : {}),
    });
  } else {
    await post('https://api.brevo.com/v3/smtp/email', { 'api-key': key }, {
      sender: { email: from.email, ...(from.name ? { name: from.name } : {}) }, to: m.to.map((email) => ({ email })),
      subject: m.subject, htmlContent: m.html, textContent: m.text, ...(m.replyTo ? { replyTo: m.replyTo } : {}),
    });
  }
}

const instituteTo = (st: Settings) => list(s(st, 'notifyEmailTo') || s(st, 'email'));
const accent = (st: Settings) => s(st, 'emailButtonColor').trim() || '#C24E17';

/** New-lead email to the institute. */
export async function sendLeadEmail(st: Settings, l: LeadForAlert, toOverride?: string[]) {
  const v = leadVars(st, l);
  const wa = digits(l.phone);
  const buttons = `<p style="margin:0 0 16px">${btn(leadUrl(l), 'Open in admin', accent(st))}${wa ? btn(`https://wa.me/${wa.length === 10 ? '91' + wa : wa}`, 'WhatsApp student', '#1FA855') : ''}${btn('tel:' + l.phone.replace(/[^\d+]/g, ''), 'Call', '#1B2A6B')}</p>`;
  const body = tpl(st, 'emailBodyTpl');
  const html = layout(st, fill(tpl(st, 'emailHeadingTpl'), v), buttons + bodyHtml(body, v, l, accent(st)),
    fill(tpl(st, 'emailFooterTpl'), v) + (l.email ? '' : '\n(No email given — use phone/WhatsApp.)'));
  const text = bodyText(body, v, l) + `\n\nOpen in admin: ${leadUrl(l)}`;
  const replyTo = l.email && /@/.test(l.email) ? { email: l.email, name: l.name } : undefined;
  await sendMail(st, { to: toOverride ?? instituteTo(st), subject: (isSpam(l) ? '[Possible spam] ' : '') + fill(tpl(st, 'emailSubjectTpl'), v).replace(/\s+/g, ' ').trim(), html, text, replyTo });
}

/** Auto-reply to the student / applicant (only when they gave an email). */
export async function sendStudentReply(st: Settings, l: LeadForAlert, toOverride?: string) {
  const to = toOverride || l.email;
  if (!to || !/@/.test(to)) return;
  const v = leadVars(st, l);
  const body = l.type === 'career' ? tpl(st, 'studentReplyCareerBodyTpl') : tpl(st, 'studentReplyBodyTpl');
  const replyEmail = list(s(st, 'studentReplyTo') || s(st, 'email'))[0];
  await sendMail(st, {
    to: [to], subject: fill(tpl(st, 'studentReplySubjectTpl'), v).replace(/\s+/g, ' ').trim(),
    html: layout(st, v.site, bodyHtml(body, v, l, accent(st)), ''), text: bodyText(body, v, l),
    replyTo: replyEmail ? { email: replyEmail, name: v.site } : undefined,
  });
}

export type PaymentForAlert = { amount: number; courseTitle: string; paymentId: string; name?: string | null; email?: string | null; phone?: string | null };

/** Payment received: email to the institute and (optionally) a confirmation to the student. Never throws. */
export async function notifyPayment(p: PaymentForAlert, lead: LeadForAlert | null) {
  let st: Settings;
  try { st = await getSettings(); } catch (e) { console.error('[notify] settings', e); return; }
  const l: LeadForAlert = lead ?? { id: 0, type: 'enquiry', name: p.name || 'Student', phone: p.phone || '', email: p.email };
  const v = leadVars(st, { ...l, course: p.courseTitle }, {
    amount: (p.amount / 100).toLocaleString('en-IN'), paymentId: p.paymentId,
    name: p.name || l.name, email: p.email || l.email || '', phone: p.phone || l.phone,
  });
  v.firstName = v.name.trim().split(/\s+/)[0] || v.name;
  const jobs: Promise<unknown>[] = [];
  if (flag(st, 'notifyPaymentEmail')) {
    const b = tpl(st, 'paymentBodyTpl');
    jobs.push(sendMail(st, { to: instituteTo(st), subject: fill(tpl(st, 'paymentSubjectTpl'), v), html: layout(st, `Payment received — ₹${v.amount}`, bodyHtml(b, v, null, accent(st)), ''), text: bodyText(b, v, null) })
      .catch((e) => console.error(`[notify] payment email ${v.leadId} failed:`, (e as Error).message)));
  }
  if (flag(st, 'studentPaymentEmail') && v.email && /@/.test(v.email)) {
    const b = tpl(st, 'studentPaymentBodyTpl');
    jobs.push(sendMail(st, { to: [v.email], subject: fill(tpl(st, 'studentPaymentSubjectTpl'), v), html: layout(st, v.site, bodyHtml(b, v, null, accent(st)), ''), text: bodyText(b, v, null) })
      .catch((e) => console.error(`[notify] student payment email ${v.leadId} failed:`, (e as Error).message)));
  }
  await Promise.all(jobs);
}

/** Short plain-text alert for WhatsApp / Telegram. */
function shortText(l: LeadForAlert) {
  const keep = new Set(['Lead ID', 'Name', 'Phone / WhatsApp', 'Email', 'Country', 'Language', 'Level', 'Course', 'Position', 'Mode', 'Batch', 'Exam', 'Preferred timing', 'Centre', 'Message', 'Source', 'Note']);
  const body = rows(l).filter(([k]) => keep.has(k) && k !== 'Lead ID')
    .map(([k, v]) => `${k}: ${String(v).replace(/\s+/g, ' ').slice(0, k === 'Message' ? 300 : 120)}`).join('\n');
  const wa = digits(l.phone);
  const waLink = wa ? `\nWhatsApp student: https://wa.me/${wa.length === 10 ? '91' + wa : wa}` : '';
  return `${isSpam(l) ? '[Possible spam] ' : ''}New ${TYPE_LABEL[l.type] ?? 'enquiry'} (${leadId(l.id)})\n\n${body}\n${waLink}\nOpen in admin: ${leadUrl(l)}`;
}

/** CallMeBot (free): one "number apikey" pair per line — each number gets its own key from CallMeBot. */
function callmebotRecipients(st: Settings) {
  return s(st, 'callmebotRecipients').split('\n').map((line) => {
    const [num = '', key = ''] = line.trim().split(/[\s,;:]+/);
    const n = digits(num);
    return { phone: n.length === 10 ? '91' + n : n, key: key.trim() };
  }).filter((r) => r.phone.length >= 11 && r.key);
}

export async function sendLeadWhatsapp(st: Settings, l: LeadForAlert) {
  const to = callmebotRecipients(st);
  if (!to.length) throw new Error('Add at least one line "number apikey", e.g. 919999904123 1234567.');
  const text = shortText(l);
  const errors: string[] = [];
  for (const r of to) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=%2B${r.phone}&apikey=${encodeURIComponent(r.key)}&text=${encodeURIComponent(text)}`;
    try {
      const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(20_000) });
      const body = (await res.text().catch(() => '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!res.ok || /error|invalid|not allowed|wrong/i.test(body)) throw new Error(`${res.status} ${body.slice(0, 200)}`);
    } catch (e) { errors.push(`+${r.phone}: ${(e as Error).message}`); }
  }
  if (errors.length) throw new Error(errors.join(' · '));
}

/** Telegram bot (free, official). */
export async function sendLeadTelegram(st: Settings, l: LeadForAlert) {
  const token = s(st, 'telegramBotToken').trim();
  const chats = list(s(st, 'telegramChatIds'));
  if (!token) throw new Error('Bot token is not set.');
  if (!chats.length) throw new Error('No chat ID set.');
  for (const chat_id of chats) {
    await post(`https://api.telegram.org/bot${token}/sendMessage`, {}, { chat_id, text: shortText(l), disable_web_page_preview: true });
  }
}

/** Telegram helper: chat IDs of everyone who has sent /start to the bot. */
export async function telegramChatIds(st: Settings) {
  const token = s(st, 'telegramBotToken').trim();
  if (!token) throw new Error('Save the bot token first.');
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json.description || `Telegram error ${res.status}`);
  const found = new Map<string, string>();
  for (const u of json.result ?? []) {
    const c = u.message?.chat ?? u.my_chat_member?.chat ?? u.channel_post?.chat;
    if (c?.id) found.set(String(c.id), c.title || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.username || '');
  }
  return [...found.entries()].map(([id, name]) => `${name || 'Chat'}: ${id}`);
}

/** Fire all enabled alerts for a newly saved lead. Errors are logged, never thrown. */
export async function notifyNewLead(l: LeadForAlert) {
  let st: Settings;
  try { st = await getSettings(); } catch (e) { console.error('[notify] settings', e); return; }
  const jobs: Promise<void>[] = [];
  if (flag(st, 'notifyEmailEnabled')) jobs.push(sendLeadEmail(st, l).catch((e) => console.error(`[notify] email ${leadId(l.id)} failed:`, (e as Error).message)));
  if (flag(st, 'notifyWhatsappEnabled')) jobs.push(sendLeadWhatsapp(st, l).catch((e) => console.error(`[notify] whatsapp ${leadId(l.id)} failed:`, (e as Error).message)));
  if (flag(st, 'studentReplyEnabled') && l.email && !isSpam(l) && (l.type !== 'career' || flag(st, 'studentReplyCareer')))
    jobs.push(sendStudentReply(st, l).catch((e) => console.error(`[notify] student reply ${leadId(l.id)} failed:`, (e as Error).message)));
  if (flag(st, 'notifyTelegramEnabled')) jobs.push(sendLeadTelegram(st, l).catch((e) => console.error(`[notify] telegram ${leadId(l.id)} failed:`, (e as Error).message)));
  await Promise.all(jobs);
}
