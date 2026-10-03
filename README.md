# Edexo website

Website and admin panel for **Edexo**, a German language institute in Delhi (edexo.in).

- **Stack:** Next.js 15 (App Router) · PostgreSQL · Drizzle ORM
- **Admin panel:** `/admin`. Every piece of website content can be edited from here: courses, prices, languages, blog posts, pages, testimonials, centres, menus, home page sections, images, SEO. Enquiries (free demo / contact / call-back forms) are listed here too and can be exported as CSV.
- **Images** are stored in the database, so no separate file storage is needed.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run migrate              # create tables
npm run seed                 # add the starting Edexo content and the first admin user
npm run dev                  # http://localhost:3000  (admin: /admin)
```

## Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Long random string that signs admin logins (24+ characters) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account, created on first start if no admin exists |
| `SITE_URL` | Public URL, used for the sitemap and social share links (e.g. `https://edexo.in`) |

## Deploying (Railway)

`npm run build` builds the site; `npm start` applies database migrations, seeds content on the very first start, then starts the server. On Railway: one Postgres service plus this repo as a service, with the variables above (`DATABASE_URL` referencing the Postgres service).

## Changing the database

Edit `src/db/schema.ts`, run `npm run db:generate` to create a new SQL migration in `drizzle/`, and commit it. Migrations run automatically on start.

## Project layout

- `src/app/(site)` — public pages
- `src/app/admin` — admin panel
- `src/admin/resources.ts` — what each admin list/edit screen contains
- `src/lib/settings.ts` — site-wide settings (hero, headings, footer, SEO…)
- `scripts/` — migrate and seed scripts; `seed/images` — starting images
