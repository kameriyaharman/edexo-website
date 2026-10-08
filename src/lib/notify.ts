import 'server-only';
import { getSettings, s, type Settings } from '@/lib/settings';
import { leadId } from '@/lib/format';
import { siteUrl } from '@/lib/seo';

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

function subject(l: LeadForAlert) {
  const what = l.course || l.language || TYPE_LABEL[l.type] || 'Enquiry';
  return `${l.notes?.startsWith('Possible spam') ? '[Possible spam] ' : ''}New ${TYPE_LABEL[l.type] ?? 'enquiry'}: ${l.name} — ${what} (${leadId(l.id)})`;
}

function emailHtml(l: LeadForAlert, st: Settings) {
  const wa = digits(l.phone);
  const waLink = wa ? `https://wa.me/${wa.length === 10 ? '91' + wa : wa}` : '';
  const tr = rows(l).map(([k, v]) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #ECEEF4;color:#4F566B;white-space:nowrap;vertical-align:top">${esc(k)}</td>` +
    `<td style="padding:8px 12px;border-bottom:1px solid #ECEEF4;color:#0B1640;white-space:pre-wrap">${esc(String(v))}</td></tr>`).join('');
  const btn = (href: string, label: string, bg: string) =>
    `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 16px;border-radius:8px;background:${bg};color:#fff;text-decoration:none;font-weight:600">${label}</a>`;
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0B1640">
<div style="background:#1B2A6B;color:#fff;padding:16px 20px;border-radius:10px 10px 0 0;font-size:18px;font-weight:700">New lead on ${esc(s(st, 'siteName', 'Edexo'))} website</div>
<div style="border:1px solid #ECEEF4;border-top:0;border-radius:0 0 10px 10px;padding:16px 20px">
<p style="margin:0 0 14px">${btn(leadUrl(l), 'Open in admin', '#C24E17')}${waLink ? btn(waLink, 'WhatsApp student', '#1FA855') : ''}${btn('tel:' + l.phone.replace(/[^\d+]/g, ''), 'Call', '#1B2A6B')}</p>
<table style="border-collapse:collapse;width:100%;font-size:14px">${tr}</table>
<p style="color:#4F566B;font-size:12px;margin:16px 0 0">Sent automatically by the website. Reply to this email to answer the student${l.email ? '' : ' (no email given — use phone/WhatsApp)'}.</p>
</div></div>`;
}

function emailText(l: LeadForAlert) {
  return rows(l).map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nOpen in admin: ${leadUrl(l)}`;
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

export async function sendLeadEmail(st: Settings, l: LeadForAlert, toOverride?: string[]) {
  const to = toOverride ?? list(s(st, 'notifyEmailTo') || s(st, 'email'));
  const key = s(st, 'emailApiKey').trim();
  const from = parseFrom(s(st, 'emailFrom') || `Edexo Website <${s(st, 'email', 'info@edexo.in')}>`);
  if (!to.length) throw new Error('No "send to" email address set.');
  if (!key) throw new Error('Email API key is not set.');
  const replyTo = l.email && /@/.test(l.email) ? l.email : undefined;
  const subj = subject(l), html = emailHtml(l, st), text = emailText(l);
  if (s(st, 'emailProvider', 'brevo') === 'resend') {
    await post('https://api.resend.com/emails', { authorization: `Bearer ${key}` }, {
      from: from.name ? `${from.name} <${from.email}>` : from.email, to, subject: subj, html, text, ...(replyTo ? { reply_to: replyTo } : {}),
    });
  } else {
    await post('https://api.brevo.com/v3/smtp/email', { 'api-key': key }, {
      sender: { email: from.email, ...(from.name ? { name: from.name } : {}) }, to: to.map((email) => ({ email })),
      subject: subj, htmlContent: html, textContent: text, ...(replyTo ? { replyTo: { email: replyTo, name: l.name } } : {}),
    });
  }
}

/** Short plain-text alert for WhatsApp / Telegram. */
function shortText(l: LeadForAlert) {
  const keep = new Set(['Lead ID', 'Name', 'Phone / WhatsApp', 'Email', 'Country', 'Language', 'Level', 'Course', 'Position', 'Mode', 'Batch', 'Exam', 'Preferred timing', 'Centre', 'Message', 'Source', 'Note']);
  const body = rows(l).filter(([k]) => keep.has(k) && k !== 'Lead ID')
    .map(([k, v]) => `${k}: ${String(v).replace(/\s+/g, ' ').slice(0, k === 'Message' ? 300 : 120)}`).join('\n');
  const wa = digits(l.phone);
  const waLink = wa ? `\nWhatsApp student: https://wa.me/${wa.length === 10 ? '91' + wa : wa}` : '';
  return `${l.notes?.startsWith('Possible spam') ? '[Possible spam] ' : ''}New ${TYPE_LABEL[l.type] ?? 'enquiry'} (${leadId(l.id)})\n\n${body}\n${waLink}\nOpen in admin: ${leadUrl(l)}`;
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
  if (flag(st, 'notifyTelegramEnabled')) jobs.push(sendLeadTelegram(st, l).catch((e) => console.error(`[notify] telegram ${leadId(l.id)} failed:`, (e as Error).message)));
  await Promise.all(jobs);
}
