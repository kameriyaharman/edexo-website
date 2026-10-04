import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';

export type FieldType = 'text' | 'textarea' | 'lines' | 'markdown' | 'number' | 'boolean' | 'image' | 'select' | 'date' | 'url' | 'secret';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  /** shown inside the input on the left, e.g. ₹ */
  prefix?: string;
  /** shows a live character counter */
  maxLength?: number;
  /** admin form card this field is shown in (defaults to "Details") */
  group?: string;
}

export interface SettingsGroup {
  key: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

/** Everything on the site that is not a list lives here, grouped for the admin "Site settings" screen. */
export const settingsGroups: SettingsGroup[] = [
  {
    key: 'general', title: 'Brand & contact',
    fields: [
      { name: 'siteName', label: 'Site name', type: 'text', required: true },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'logoId', label: 'Logo (for light backgrounds)', type: 'image' },
      { name: 'logoWhiteId', label: 'Logo (for the dark footer)', type: 'image' },
      { name: 'faviconId', label: 'Favicon / app icon (square)', type: 'image' },
      { name: 'primaryPhone', label: 'Main phone number', type: 'text' },
      { name: 'whatsapp', label: 'WhatsApp number (digits with country code, e.g. 919953774123)', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'facebook', label: 'Facebook URL', type: 'url' },
      { name: 'instagram', label: 'Instagram URL', type: 'url' },
      { name: 'youtube', label: 'YouTube URL', type: 'url' },
      { name: 'linkedin', label: 'LinkedIn URL', type: 'url' },
      { name: 'showWhatsappButton', label: 'Show floating WhatsApp button', type: 'boolean' },
    ],
  },
  {
    key: 'header', title: 'Header',
    fields: [
      { name: 'topbarItems', label: 'Top bar items (one per line)', type: 'lines' },
      { name: 'headerCtaLabel', label: 'Header button label', type: 'text' },
      { name: 'headerCtaHref', label: 'Header button link', type: 'text' },
      { name: 'signInLabel', label: 'Sign-in link label', type: 'text' },
      { name: 'signInHref', label: 'Sign-in link URL (leave empty to hide)', type: 'text' },
    ],
  },
  {
    key: 'hero', title: 'Home — hero',
    fields: [
      { name: 'heroEyebrow', label: 'Small label above heading (tagline)', type: 'text' },
      { name: 'heroTitle', label: 'Heading', type: 'text' },
      { name: 'heroHighlight', label: 'Heading — highlighted (orange) part', type: 'text' },
      { name: 'heroText', label: 'Paragraph', type: 'textarea' },
      { name: 'heroSubtext', label: 'Second paragraph (smaller)', type: 'textarea' },
      { name: 'heroPrimaryLabel', label: 'Primary button label', type: 'text' },
      { name: 'heroPrimaryHref', label: 'Primary button link', type: 'text' },
      { name: 'heroWhatsappLabel', label: 'WhatsApp button label (empty = hide)', type: 'text' },
      { name: 'heroSecondaryLabel', label: 'Third link label', type: 'text' },
      { name: 'heroSecondaryHref', label: 'Third link', type: 'text' },
      { name: 'heroImageId', label: 'Hero photo (portrait, plain background works best)', type: 'image' },
      { name: 'heroBadgesLeft', label: 'Floating card 1 (one item per line)', type: 'lines' },
      { name: 'heroBadgesRight', label: 'Floating card 2 (one item per line)', type: 'lines' },
      { name: 'heroStatValue', label: 'Stat card value', type: 'text' },
      { name: 'heroStatLabel', label: 'Stat card label', type: 'text' },
    ],
  },
  {
    key: 'sections', title: 'Home — section headings',
    description: 'Headings and short texts for each home page block. The cards inside come from Programs, Pages, FAQs etc.',
    fields: [
      { name: 'programsEyebrow', label: 'Programs: small label', type: 'text' },
      { name: 'programsTitle', label: 'Programs: heading', type: 'text' },
      { name: 'programsText', label: 'Programs: text', type: 'textarea' },
      { name: 'aboutEyebrow', label: 'Why Edexo: small label', type: 'text' },
      { name: 'aboutTitle', label: 'Why Edexo: heading', type: 'text' },
      { name: 'aboutText', label: 'Why Edexo: text', type: 'textarea' },
      { name: 'aboutImageId', label: 'Why Edexo: photo', type: 'image' },
      { name: 'germanEyebrow', label: 'German A1–C2: small label', type: 'text' },
      { name: 'germanTitle', label: 'German A1–C2: heading', type: 'text' },
      { name: 'germanText', label: 'German A1–C2: text', type: 'textarea' },
      { name: 'examsEyebrow', label: 'Exams: small label', type: 'text' },
      { name: 'examsTitle', label: 'Exams: heading', type: 'text' },
      { name: 'examsText', label: 'Exams: text', type: 'textarea' },
      { name: 'onlineEyebrow', label: 'Online classes: small label', type: 'text', help: 'Heading, benefits and steps come from the "Online Language Classes" page.' },
      { name: 'classesTitle', label: 'One-to-One & Group: heading', type: 'text' },
      { name: 'abroadEyebrow', label: 'Study & Work Abroad: small label', type: 'text' },
      { name: 'abroadTitle', label: 'Study & Work Abroad: heading', type: 'text' },
      { name: 'abroadText', label: 'Study & Work Abroad: text', type: 'textarea' },
      { name: 'abroadDisclaimer', label: 'Study & Work Abroad: disclaimer', type: 'textarea' },
      { name: 'intlTitle', label: 'International students: heading', type: 'text' },
      { name: 'intlText', label: 'International students: text', type: 'textarea' },
      { name: 'intlButton', label: 'International students: button', type: 'text' },
      { name: 'testimonialsEyebrow', label: 'Reviews: small label', type: 'text' },
      { name: 'testimonialsTitle', label: 'Reviews: heading', type: 'text' },
      { name: 'faqsEyebrow', label: 'FAQs: small label', type: 'text' },
      { name: 'faqsTitle', label: 'FAQs: heading', type: 'text' },
      { name: 'levelsEyebrow', label: 'Levels (old block): small label', type: 'text' },
      { name: 'levelsTitle', label: 'Levels (old block): heading', type: 'text' },
      { name: 'levelsText', label: 'Levels (old block): text', type: 'textarea' },
      { name: 'blogEyebrow', label: 'Blog: small label', type: 'text' },
      { name: 'blogTitle', label: 'Blog: heading', type: 'text' },
      { name: 'branchesTitle', label: 'Centres: heading', type: 'text' },
    ],
  },
  {
    key: 'visibility', title: 'Home — show / hide sections',
    fields: [
      { name: 'showFeatures', label: 'Feature strip', type: 'boolean' },
      { name: 'showPrograms', label: 'Popular language programs', type: 'boolean' },
      { name: 'showWhy', label: 'Why choose Edexo', type: 'boolean' },
      { name: 'showGerman', label: 'German A1–C2', type: 'boolean' },
      { name: 'showExams', label: 'Exam preparation', type: 'boolean' },
      { name: 'showOnline', label: 'Online classes', type: 'boolean' },
      { name: 'showClasses', label: 'One-to-one & group classes', type: 'boolean' },
      { name: 'showAbroad', label: 'Study & work abroad', type: 'boolean' },
      { name: 'showInternational', label: 'International students', type: 'boolean' },
      { name: 'showTestimonials', label: 'Student reviews', type: 'boolean' },
      { name: 'showStats', label: 'Stats', type: 'boolean' },
      { name: 'showFaqs', label: 'FAQs', type: 'boolean' },
      { name: 'showLevels', label: 'Course levels (old block)', type: 'boolean' },
      { name: 'showBlog', label: 'Latest articles', type: 'boolean' },
      { name: 'showBranches', label: 'Centres', type: 'boolean' },
    ],
  },
  {
    key: 'enquiry', title: 'Forms & page headings',
    fields: [
      { name: 'enquiryTitle', label: 'Demo form / final CTA: heading', type: 'text' },
      { name: 'enquiryText', label: 'Demo form / final CTA: text', type: 'textarea' },
      { name: 'enquiryPoints', label: 'Demo form: tick points (one per line)', type: 'lines' },
      { name: 'enquiryButton', label: 'Demo form: button label', type: 'text' },
      { name: 'enquirySuccess', label: 'Message shown after submitting', type: 'textarea' },
      { name: 'contactTitle', label: 'Contact page: heading', type: 'text' },
      { name: 'contactText', label: 'Contact page: text', type: 'textarea' },
      { name: 'coursesTitle', label: 'Courses & Fees page: heading', type: 'text' },
      { name: 'coursesText', label: 'Courses & Fees page: text', type: 'textarea' },
    ],
  },
  {
    key: 'footer', title: 'Footer',
    fields: [
      { name: 'footerAbout', label: 'About text', type: 'textarea' },
      { name: 'footerUsefulTitle', label: 'Column "Quick Links" heading', type: 'text' },
      { name: 'footerCoursesTitle', label: 'Column "Popular Programs" heading', type: 'text' },
      { name: 'footerSupportTitle', label: 'Column "Support" heading', type: 'text' },
      { name: 'footerLocationsTitle', label: 'Column "Contact" heading (centres)', type: 'text', help: 'The centres themselves are edited under Content → Centres. Links in the other columns: Content → Menus.' },
      { name: 'copyright', label: 'Copyright line ({year} = current year)', type: 'text' },
      { name: 'creditText', label: 'Developer credit text', type: 'text', placeholder: 'Developed by Custom E Solution', help: 'Shown next to the copyright line. Leave empty to hide.' },
      { name: 'creditUrl', label: 'Developer credit link', type: 'url', placeholder: 'http://customesolution.com/' },
    ],
  },
  {
    key: 'seo', title: 'SEO',
    fields: [
      { name: 'seoTitle', label: 'Home page title', type: 'text', maxLength: 70, help: 'Shown as the blue link in Google for the home page.' },
      { name: 'seoDescription', label: 'Home page description', type: 'textarea', maxLength: 170, help: 'Also used for pages that have no description of their own.' },
      { name: 'coursesSeoTitle', label: 'Courses & Fees page — title', type: 'text', maxLength: 70 },
      { name: 'coursesSeoDescription', label: 'Courses & Fees page — description', type: 'textarea', maxLength: 170 },
      { name: 'blogSeoTitle', label: 'Blog page — title', type: 'text', maxLength: 70 },
      { name: 'blogSeoDescription', label: 'Blog page — description', type: 'textarea', maxLength: 170 },
      { name: 'contactSeoTitle', label: 'Contact page — title', type: 'text', maxLength: 70 },
      { name: 'contactSeoDescription', label: 'Contact page — description', type: 'textarea', maxLength: 170 },
      { name: 'ogImageId', label: 'Social share image (1200×630)', type: 'image', help: 'Shown when a link is shared on WhatsApp, Facebook, LinkedIn.' },
      { name: 'robotsIndex', label: 'Allow Google to index the website', type: 'boolean', help: 'Keep ON for the live site. The Railway preview address is never indexed.' },
      { name: 'googleVerification', label: 'Google Search Console verification code', type: 'text', placeholder: 'content value of the google-site-verification tag' },
      { name: 'bingVerification', label: 'Bing Webmaster verification code', type: 'text' },
    ],
  },
  {
    key: 'payments', title: 'Payments (Razorpay)',
    description: 'After an enquiry form is sent, students land on a Thank-you page showing their course and fee with a "Pay Now" button.',
    fields: [
      { name: 'razorpayEnabled', label: 'Show "Pay Now" on the Thank-you page', type: 'boolean', help: 'Needs the Key ID and Key Secret below.' },
      { name: 'razorpayKeyId', label: 'Razorpay Key ID', type: 'text', placeholder: 'rzp_live_… or rzp_test_…', help: 'Razorpay Dashboard → Account & Settings → API Keys.' },
      { name: 'razorpayKeySecret', label: 'Razorpay Key Secret', type: 'secret', help: 'Stored on the server only, never shown on the website. Leave empty to keep the saved secret.' },
      { name: 'razorpayWebhookSecret', label: 'Razorpay Webhook Secret (recommended)', type: 'secret', help: 'Dashboard → Webhooks → add {site}/api/pay/webhook with events payment.captured, payment.failed, order.paid. Leave empty to keep the saved one.' },
      { name: 'paymentBrandName', label: 'Name shown in the payment window', type: 'text', placeholder: 'Edexo' },
      { name: 'thankYouTitle', label: 'Thank-you page: heading', type: 'text', placeholder: 'Thank you! Your enquiry has been received.' },
      { name: 'thankYouText', label: 'Thank-you page: text', type: 'textarea' },
      { name: 'paymentNote', label: 'Note under the Pay Now button', type: 'textarea', placeholder: 'Fees are confirmed by our team before your batch starts…' },
      { name: 'paidText', label: 'Message after a successful payment', type: 'textarea' },
    ],
  },
  {
    key: 'analytics', title: 'Analytics & tracking',
    description: 'Form submissions, WhatsApp clicks, phone clicks and button clicks are sent to every tag that is filled in.',
    fields: [
      { name: 'ga4Id', label: 'Google Analytics 4 measurement ID', type: 'text', placeholder: 'G-XXXXXXXXXX', help: 'Leave empty if GA4 is already set up inside Google Tag Manager.' },
      { name: 'gtmId', label: 'Google Tag Manager container ID', type: 'text', placeholder: 'GTM-XXXXXXX' },
      { name: 'metaPixelId', label: 'Meta (Facebook) Pixel ID', type: 'text', placeholder: '15–16 digit number' },
      { name: 'googleAdsId', label: 'Google Ads conversion ID', type: 'text', placeholder: 'AW-XXXXXXXXX' },
      { name: 'googleAdsLabel', label: 'Google Ads conversion label (for leads)', type: 'text', placeholder: 'e.g. AbC-D_efGhIjK' },
      { name: 'cookieNotice', label: 'Show cookie notice', type: 'boolean', help: 'A small bar linking to the Cookie Policy. Recommended when Meta Pixel / Ads are used.' },
    ],
  },
];

export type Settings = Record<string, string | number | boolean | null | undefined>;

export const getSettings = cache(async (): Promise<Settings> => {
  const row = await db.query.settings.findFirst({ where: eq(schema.settings.id, 1) });
  return (row?.data ?? {}) as Settings;
});

export function s(settings: Settings, key: string, fallback = ''): string {
  const v = settings[key];
  return v === undefined || v === null ? fallback : String(v);
}

export function lines(settings: Settings, key: string): string[] {
  return s(settings, key).split('\n').map((l) => l.trim()).filter(Boolean);
}

export function on(settings: Settings, key: string): boolean {
  const v = settings[key];
  return v === undefined ? true : v === true || v === 'true';
}

export function imageId(settings: Settings, key: string): number | null {
  const v = Number(settings[key]);
  return Number.isFinite(v) && v > 0 ? v : null;
}
