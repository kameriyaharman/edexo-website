import { schema } from '@/db';
import { iconNames } from '@/components/Icon';
import type { FieldDef } from '@/lib/settings';

const icons = iconNames.map((v) => ({ value: v, label: v }));
const toneOpts = ['orange', 'navy', 'green', 'amber', 'blue'].map((v) => ({ value: v, label: v }));

export interface ResourceField extends FieldDef {
  /** select options loaded from another resource table: [resourceKey, labelColumn] */
  optionsFrom?: [string, string];
}

export interface Resource {
  key: string;
  label: string;
  singular: string;
  description?: string;
  table: any; // drizzle table
  fields: ResourceField[];
  columns: string[];
  orderBy: 'sort' | 'publishedAt' | 'createdAt';
  slugFrom?: string;
  viewUrl?: (row: any) => string | null;
}

const seo: ResourceField[] = [
  { name: 'seoTitle', label: 'SEO title (optional)', type: 'text' },
  { name: 'seoDescription', label: 'SEO description (optional)', type: 'textarea' },
];

export const resources: Resource[] = [
  {
    key: 'courses', label: 'Courses', singular: 'course', table: schema.courses, orderBy: 'sort', slugFrom: 'title',
    description: 'Course cards on the home page, the Courses page and each course detail page.',
    columns: ['imageId', 'title', 'languageId', 'price', 'duration', 'published'],
    viewUrl: (r) => `/courses/${r.slug}`,
    fields: [
      { name: 'title', label: 'Course name', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to create it from the name. Used in /courses/your-slug' },
      { name: 'languageId', label: 'Language (tab)', type: 'select', optionsFrom: ['languages', 'name'] },
      { name: 'level', label: 'Level', type: 'text', placeholder: 'A1' },
      { name: 'price', label: 'Price (₹)', type: 'number' },
      { name: 'mrp', label: 'Original price / MRP (₹) — shown struck through', type: 'number' },
      { name: 'duration', label: 'Duration', type: 'text', placeholder: '2 months' },
      { name: 'mode', label: 'Mode', type: 'text', placeholder: 'Online / Offline' },
      { name: 'imageId', label: 'Course image (landscape)', type: 'image' },
      { name: 'shortDesc', label: 'Short description (card)', type: 'textarea' },
      { name: 'description', label: 'Full description (course page)', type: 'markdown' },
      { name: 'highlights', label: 'Highlights (one per line)', type: 'lines' },
      { name: 'featured', label: 'Featured', type: 'boolean' },
      { name: 'published', label: 'Published (visible on site)', type: 'boolean' },
      { name: 'sort', label: 'Order (lower first)', type: 'number' },
      ...seo,
    ],
  },
  {
    key: 'languages', label: 'Languages', singular: 'language', table: schema.languages, orderBy: 'sort', slugFrom: 'name',
    description: 'The tabs in "Choose Your Language".',
    columns: ['name', 'code', 'sort', 'active'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to create it from the name.' },
      { name: 'code', label: 'Badge code (e.g. DE)', type: 'text' },
      { name: 'intro', label: 'Short intro', type: 'textarea' },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'posts', label: 'Blog posts', singular: 'post', table: schema.posts, orderBy: 'publishedAt', slugFrom: 'title',
    columns: ['coverId', 'title', 'publishedAt', 'published'],
    viewUrl: (r) => `/blog/${r.slug}`,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to create it from the title.' },
      { name: 'excerpt', label: 'Excerpt (card)', type: 'textarea' },
      { name: 'coverId', label: 'Cover image', type: 'image' },
      { name: 'content', label: 'Article', type: 'markdown' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'publishedAt', label: 'Publish date', type: 'date' },
      { name: 'published', label: 'Published', type: 'boolean' },
      ...seo,
    ],
  },
  {
    key: 'testimonials', label: 'Testimonials', singular: 'testimonial', table: schema.testimonials, orderBy: 'sort',
    columns: ['photoId', 'name', 'rating', 'active'],
    fields: [
      { name: 'name', label: 'Student name', type: 'text', required: true },
      { name: 'role', label: 'Course / role', type: 'text' },
      { name: 'quote', label: 'Review', type: 'textarea', required: true },
      { name: 'rating', label: 'Rating (1–5)', type: 'number' },
      { name: 'photoId', label: 'Photo (square)', type: 'image' },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'pages', label: 'Pages', singular: 'page', table: schema.pages, orderBy: 'createdAt', slugFrom: 'title',
    description: 'Content pages such as About, German Language, Privacy Policy. Each opens at /slug.',
    columns: ['title', 'slug', 'published'],
    viewUrl: (r) => (r.slug === 'about' ? '/about' : `/${r.slug}`),
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Page opens at /slug. Use "about" for the About page.' },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'imageId', label: 'Image (optional)', type: 'image' },
      { name: 'content', label: 'Content', type: 'markdown' },
      { name: 'published', label: 'Published', type: 'boolean' },
      ...seo,
    ],
  },
  {
    key: 'branches', label: 'Centres', singular: 'centre', table: schema.branches, orderBy: 'sort',
    columns: ['name', 'phones', 'active'],
    fields: [
      { name: 'name', label: 'Centre name', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'textarea', required: true },
      { name: 'landmark', label: 'Nearby metro / landmark', type: 'text' },
      { name: 'phones', label: 'Phone numbers (one per line)', type: 'lines' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'mapUrl', label: 'Google Maps link', type: 'url' },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'features', label: 'Feature strip', singular: 'feature', table: schema.features, orderBy: 'sort',
    description: 'The row of 4 icons under the hero.',
    columns: ['title', 'icon', 'active'],
    fields: [
      { name: 'title', label: 'Text', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'select', options: icons },
      { name: 'tone', label: 'Colour', type: 'select', options: toneOpts },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'reasons', label: 'Why-learn reasons', singular: 'reason', table: schema.reasons, orderBy: 'sort',
    description: 'The 4 cards in "Why Learn German With Us?".',
    columns: ['title', 'icon', 'active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Text', type: 'textarea' },
      { name: 'icon', label: 'Icon', type: 'select', options: icons },
      { name: 'tone', label: 'Colour', type: 'select', options: toneOpts },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'levels', label: 'Course levels', singular: 'level', table: schema.levels, orderBy: 'sort',
    description: 'The "Your Path From A1 to C2" cards.',
    columns: ['code', 'title', 'featured', 'active'],
    fields: [
      { name: 'code', label: 'Level code (e.g. A1)', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Text', type: 'textarea' },
      { name: 'buttonLabel', label: 'Button label', type: 'text' },
      { name: 'link', label: 'Button link', type: 'text' },
      { name: 'featured', label: 'Highlighted (dark card)', type: 'boolean' },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'stats', label: 'Stats', singular: 'stat', table: schema.stats, orderBy: 'sort',
    columns: ['value', 'label', 'active'],
    fields: [
      { name: 'value', label: 'Number (e.g. 7+)', type: 'text', required: true },
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'select', options: icons },
      { name: 'tone', label: 'Colour', type: 'select', options: toneOpts },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'menu', label: 'Menus', singular: 'menu link', table: schema.menuItems, orderBy: 'sort',
    description: 'Header navigation and the two footer link columns.',
    columns: ['label', 'href', 'location', 'active'],
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'href', label: 'Link (e.g. /courses or https://…)', type: 'text', required: true },
      { name: 'location', label: 'Where', type: 'select', options: [
        { value: 'header', label: 'Header' }, { value: 'footer_useful', label: 'Footer — column 1' }, { value: 'footer_courses', label: 'Footer — column 2' },
      ] },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
];

export function getResource(key: string) {
  return resources.find((r) => r.key === key) ?? null;
}
