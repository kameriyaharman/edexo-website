import 'server-only';
import { getSettings, s, type Settings } from '@/lib/settings';
import { leadId } from '@/lib/format';
import { siteUrl } from '@/lib/seo';

/**
 * New-lead alerts to the institute: email (Brevo or Resend HTTP API — Railway Hobby blocks SMTP)
 * and WhatsApp (Meta Cloud API template, AiSensy campaign, or any webhook such as Pabbly/Zapier/Interakt).
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

/** The 6 template variables, in order: {{1}} type, {{2}} name, {{3}} phone, {{4}} course, {{5}} source, {{6}} lead ID. */
function waParams(l: LeadForAlert): string[] {
  const clean = (v: string) => (v || '-').replace(/\s+/g, ' ').trim().slice(0, 200) || '-';
  const course = [l.course, l.language && l.course?.toLowerCase().includes(l.language.toLowerCase()) ? '' : l.language, l.mode].filter(Boolean).join(' · ');
  return [TYPE_LABEL[l.type] ?? 'Enquiry', l.name, l.phone, course || '-', l.source || 'Website', leadId(l.id)].map(clean);
}

export async function sendLeadWhatsapp(st: Settings, l: LeadForAlert, toOverride?: string[]) {
  const to = (toOverride ?? list(s(st, 'notifyWhatsappTo') || s(st, 'whatsapp'))).map(digits).filter((n) => n.length >= 10)
    .map((n) => (n.length === 10 ? '91' + n : n));
  const provider = s(st, 'whatsappProvider', 'meta');
  const params = waParams(l);
  if (provider === 'webhook') {
    const url = s(st, 'whatsappWebhookUrl').trim();
    if (!/^https:\/\//.test(url)) throw new Error('Webhook URL must start with https://');
    await post(url, {}, { event: 'new_lead', to, leadId: leadId(l.id), adminUrl: leadUrl(l), text: `${subject(l)}\n\n${emailText(l)}`, params, lead: l });
    return;
  }
  if (!to.length) throw new Error('No WhatsApp number set to send alerts to.');
  if (provider === 'aisensy') {
    const key = s(st, 'aisensyApiKey').trim(), campaign = s(st, 'aisensyCampaign').trim();
    if (!key || !campaign) throw new Error('AiSensy API key and campaign name are required.');
    for (const n of to) {
      await post('https://backend.aisensy.com/campaign/t1/api/v2', {}, {
        apiKey: key, campaignName: campaign, destination: n, userName: 'Edexo Website', templateParams: params, source: 'edexo-website',
      });
    }
    return;
  }
  // Meta WhatsApp Cloud API — business-initiated messages must use an approved template.
  const phoneId = s(st, 'waPhoneNumberId').trim(), token = s(st, 'waAccessToken').trim();
  const template = s(st, 'waTemplateName').trim(), lang = s(st, 'waTemplateLang', 'en').trim() || 'en';
  if (!phoneId || !token || !template) throw new Error('Phone number ID, access token and template name are required.');
  for (const n of to) {
    await post(`https://graph.facebook.com/v21.0/${encodeURIComponent(phoneId)}/messages`, { authorization: `Bearer ${token}` }, {
      messaging_product: 'whatsapp', to: n, type: 'template',
      template: { name: template, language: { code: lang }, components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }] },
    });
  }
}

/** Fire all enabled alerts for a newly saved lead. Errors are logged, never thrown. */
export async function notifyNewLead(l: LeadForAlert) {
  let st: Settings;
  try { st = await getSettings(); } catch (e) { console.error('[notify] settings', e); return; }
  const jobs: Promise<void>[] = [];
  if (flag(st, 'notifyEmailEnabled')) jobs.push(sendLeadEmail(st, l).catch((e) => console.error(`[notify] email ${leadId(l.id)} failed:`, (e as Error).message)));
  if (flag(st, 'notifyWhatsappEnabled')) jobs.push(sendLeadWhatsapp(st, l).catch((e) => console.error(`[notify] whatsapp ${leadId(l.id)} failed:`, (e as Error).message)));
  await Promise.all(jobs);
}
