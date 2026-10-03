import {
  pgTable, serial, text, integer, boolean, timestamp, jsonb, customType, index,
} from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() { return 'bytea'; },
});

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

/** Single-row site settings document (id = 1). */
export const settings = pgTable('settings', {
  id: integer('id').primaryKey(),
  data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Uploaded images, stored in Postgres so no extra storage service is needed. */
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  mime: text('mime').notNull(),
  width: integer('width'),
  height: integer('height'),
  size: integer('size').notNull(),
  alt: text('alt').default(''),
  data: bytea('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  code: text('code').notNull().default(''),
  intro: text('intro').default(''),
  sort: integer('sort').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  languageId: integer('language_id').references(() => languages.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  level: text('level').default(''),
  price: integer('price'),
  mrp: integer('mrp'),
  duration: text('duration').default(''),
  mode: text('mode').default('Online / Offline'),
  imageId: integer('image_id').references(() => media.id, { onDelete: 'set null' }),
  shortDesc: text('short_desc').default(''),
  description: text('description').default(''),
  highlights: text('highlights').default(''),
  featured: boolean('featured').notNull().default(false),
  sort: integer('sort').notNull().default(0),
  published: boolean('published').notNull().default(true),
  seoTitle: text('seo_title').default(''),
  seoDescription: text('seo_description').default(''),
  ...timestamps,
}, (t) => [index('courses_language_idx').on(t.languageId)]);

export const features = pgTable('features', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  icon: text('icon').notNull().default('laptop'),
  tone: text('tone').notNull().default('orange'),
  sort: integer('sort').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  description: text('description').default(''),
  buttonLabel: text('button_label').default('View Course'),
  link: text('link').default('/courses'),
  featured: boolean('featured').notNull().default(false),
  sort: integer('sort').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

export const reasons = pgTable('reasons', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').default(''),
  icon: text('icon').notNull().default('briefcase'),
  tone: text('tone').notNull().default('orange'),
  sort: integer('sort').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').default(''),
  quote: text('quote').notNull(),
  rating: integer('rating').notNull().default(5),
  photoId: integer('photo_id').references(() => media.id, { onDelete: 'set null' }),
  sort: integer('sort').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

export const stats = pgTable('stats', {
  id: serial('id').primaryKey(),
  value: text('value').notNull(),
  label: text('label').notNull(),
  icon: text('icon').notNull().default('users'),
  tone: text('tone').notNull().default('orange'),
  sort: integer('sort').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').default(''),
  coverId: integer('cover_id').references(() => media.id, { onDelete: 'set null' }),
  content: text('content').default(''),
  author: text('author').default('Edexo Team'),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow(),
  published: boolean('published').notNull().default(true),
  seoTitle: text('seo_title').default(''),
  seoDescription: text('seo_description').default(''),
  ...timestamps,
});

export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  landmark: text('landmark').default(''),
  phones: text('phones').default(''),
  email: text('email').default(''),
  mapUrl: text('map_url').default(''),
  sort: integer('sort').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  subtitle: text('subtitle').default(''),
  imageId: integer('image_id').references(() => media.id, { onDelete: 'set null' }),
  content: text('content').default(''),
  published: boolean('published').notNull().default(true),
  seoTitle: text('seo_title').default(''),
  seoDescription: text('seo_description').default(''),
  ...timestamps,
});

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  href: text('href').notNull(),
  location: text('location').notNull().default('header'),
  sort: integer('sort').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

export const enquiries = pgTable('enquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').default(''),
  course: text('course').default(''),
  branch: text('branch').default(''),
  message: text('message').default(''),
  source: text('source').default(''),
  status: text('status').notNull().default('new'),
  notes: text('notes').default(''),
  ...timestamps,
});

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').default(''),
  passwordHash: text('password_hash').notNull(),
  ...timestamps,
});

/** 301/302 redirects, e.g. old edexo.in URLs → new pages. */
export const redirects = pgTable('redirects', {
  id: serial('id').primaryKey(),
  fromPath: text('from_path').notNull().unique(),
  toPath: text('to_path').notNull(),
  permanent: boolean('permanent').notNull().default(true),
  hits: integer('hits').notNull().default(0),
  active: boolean('active').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  ...timestamps,
});
