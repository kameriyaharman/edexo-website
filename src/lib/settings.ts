import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';

export type FieldType = 'text' | 'textarea' | 'lines' | 'markdown' | 'number' | 'boolean' | 'image' | 'select' | 'date' | 'url';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
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
      { name: 'heroEyebrow', label: 'Small label above heading', type: 'text' },
      { name: 'heroTitle', label: 'Heading', type: 'text' },
      { name: 'heroHighlight', label: 'Heading — highlighted (orange) part', type: 'text' },
      { name: 'heroText', label: 'Paragraph', type: 'textarea' },
      { name: 'heroPrimaryLabel', label: 'Primary button label', type: 'text' },
      { name: 'heroPrimaryHref', label: 'Primary button link', type: 'text' },
      { name: 'heroSecondaryLabel', label: 'Secondary link label', type: 'text' },
      { name: 'heroSecondaryHref', label: 'Secondary link', type: 'text' },
      { name: 'heroImageId', label: 'Hero photo (portrait, plain background works best)', type: 'image' },
      { name: 'heroBadgesLeft', label: 'Floating card 1 (one item per line)', type: 'lines' },
      { name: 'heroBadgesRight', label: 'Floating card 2 (one item per line)', type: 'lines' },
      { name: 'heroStatValue', label: 'Stat card value', type: 'text' },
      { name: 'heroStatLabel', label: 'Stat card label', type: 'text' },
    ],
  },
  {
    key: 'sections', title: 'Home — section headings',
    fields: [
      { name: 'coursesEyebrow', label: 'Courses: small label', type: 'text' },
      { name: 'coursesTitle', label: 'Courses: heading', type: 'text' },
      { name: 'coursesText', label: 'Courses: text', type: 'textarea' },
      { name: 'aboutEyebrow', label: 'About: small label', type: 'text' },
      { name: 'aboutTitle', label: 'About: heading', type: 'text' },
      { name: 'aboutText', label: 'About: text', type: 'textarea' },
      { name: 'aboutImageId', label: 'About: photo', type: 'image' },
      { name: 'aboutBadgeValue', label: 'About: badge value', type: 'text' },
      { name: 'aboutBadgeLabel', label: 'About: badge label', type: 'text' },
      { name: 'levelsEyebrow', label: 'Levels: small label', type: 'text' },
      { name: 'levelsTitle', label: 'Levels: heading', type: 'text' },
      { name: 'levelsText', label: 'Levels: text', type: 'textarea' },
      { name: 'testimonialsEyebrow', label: 'Testimonials: small label', type: 'text' },
      { name: 'testimonialsTitle', label: 'Testimonials: heading', type: 'text' },
      { name: 'blogEyebrow', label: 'Blog: small label', type: 'text' },
      { name: 'blogTitle', label: 'Blog: heading', type: 'text' },
      { name: 'branchesTitle', label: 'Centres: heading', type: 'text' },
    ],
  },
  {
    key: 'visibility', title: 'Home — show / hide sections',
    fields: [
      { name: 'showFeatures', label: 'Feature strip', type: 'boolean' },
      { name: 'showLevels', label: 'Course levels', type: 'boolean' },
      { name: 'showTestimonials', label: 'Testimonials', type: 'boolean' },
      { name: 'showStats', label: 'Stats', type: 'boolean' },
      { name: 'showBlog', label: 'Latest articles', type: 'boolean' },
      { name: 'showBranches', label: 'Centres', type: 'boolean' },
    ],
  },
  {
    key: 'enquiry', title: 'Free demo / enquiry form',
    fields: [
      { name: 'enquiryTitle', label: 'Heading', type: 'text' },
      { name: 'enquiryText', label: 'Text', type: 'textarea' },
      { name: 'enquiryPoints', label: 'Tick points (one per line)', type: 'lines' },
      { name: 'enquiryButton', label: 'Button label', type: 'text' },
      { name: 'enquirySuccess', label: 'Message shown after submitting', type: 'textarea' },
    ],
  },
  {
    key: 'footer', title: 'Footer',
    fields: [
      { name: 'footerAbout', label: 'About text', type: 'textarea' },
      { name: 'footerUsefulTitle', label: 'Column 1 heading', type: 'text' },
      { name: 'footerCoursesTitle', label: 'Column 2 heading', type: 'text' },
      { name: 'newsletterTitle', label: 'Call-back box heading', type: 'text' },
      { name: 'newsletterText', label: 'Call-back box text', type: 'text' },
      { name: 'copyright', label: 'Copyright line ({year} = current year)', type: 'text' },
    ],
  },
  {
    key: 'seo', title: 'SEO & tracking',
    fields: [
      { name: 'seoTitle', label: 'Default page title', type: 'text' },
      { name: 'seoDescription', label: 'Default meta description', type: 'textarea' },
      { name: 'ogImageId', label: 'Social share image', type: 'image' },
      { name: 'gtmId', label: 'Google Tag Manager ID (e.g. GTM-XXXX)', type: 'text' },
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
