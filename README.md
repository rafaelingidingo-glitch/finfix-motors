# ELLY MAGARI — Premium Car Dealership Website

Production-ready car dealership website for **Elly Magari** (Pasiansi, Mwanza, Tanzania).

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, Prisma ORM and Cloudinary.

## Features

### Public website
- **Homepage** — hero, trust bar, featured vehicles, services, why-choose, recently added, CTA
- **Vehicle inventory** (`/inventory`) — search, filters (make, price range, year, transmission, fuel type, availability), sorting (newest / price asc / price desc), load-more pagination, empty state
- **Vehicle details** (`/vehicles/[slug]`) — image gallery, full specs, description, availability badge, WhatsApp inquiry with vehicle name + link, related vehicles, Vehicle JSON-LD
- **Services** (`/services`), **About** (`/about`), **Contact** (`/contact`) — map embed, directions link, validated inquiry form (stored in DB, viewable in admin)
- **WhatsApp integration** — floating button, header button, per-vehicle inquiry links (all deep links to `wa.me/255786068760` with pre-encoded messages)
- **SEO** — dynamic metadata + Open Graph, `sitemap.xml`, `robots.txt`, AutoDealer + Vehicle structured data, semantic HTML, optimized images

### Admin dashboard (`/admin`)
- Secure login (bcrypt password hashing, JWT httpOnly cookie session), one-time **setup flow** for the first SUPERADMIN
- Route protection via middleware **and** per-request server-side auth checks
- Rate limiting on login, setup and inquiry endpoints; same-origin checks on all mutations
- Dashboard overview (total / available / sold / featured vehicles, new inquiries, recently added)
- Vehicle management — create, edit, delete (with storage cleanup), multi-image upload with previews + reorder + "main photo", featured toggle, sold/available status
- Services management (content of the Services section, admin-editable)
- Site settings management (contact info, hero copy, about text, map query, Instagram)
- Inquiry inbox (new/read status, delete, vehicle link)

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons |
| Database | Prisma ORM — SQLite in this sandbox, PostgreSQL/Neon in production |
| Auth | bcryptjs + JWT (jose) in httpOnly cookie |
| Images | Cloudinary (server-side upload), local `public/uploads` fallback for dev |
| Deployment | Vercel |

---

## 1. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require"

# Security — REQUIRED in production. Generate: openssl rand -hex 32
SESSION_SECRET="<64-char random hex>"

# Public site URL (SEO, sitemap, OG images, WhatsApp message links)
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

# Cloudinary (vehicle image storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="1234567890"
CLOUDINARY_API_SECRET="your-api-secret"
```

> Secrets are only ever read server-side (`process.env` in server components / route
> handlers / middleware). Nothing is exposed to the browser except
> `NEXT_PUBLIC_SITE_URL`.

## 2. Database — PostgreSQL with Neon

This project develops against SQLite (sandbox). For production:

1. Create a database at [neon.tech](https://neon.tech) and copy the **pooled** connection string.
2. Switch the Prisma datasource provider in `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Create the schema (migration):

   ```bash
   npx prisma migrate dev --name init     # local/dev
   # or in CI/production:
   npx prisma migrate deploy
   ```

4. (Optional) Seed default services + settings + placeholder inventory:

   ```bash
   bun prisma/seed.ts        # or: npx tsx prisma/seed.ts
   ```

   The app also works without seeding — services and site settings fall back to
   sensible defaults, and the admin can add all content from the dashboard.

## 3. Cloudinary configuration

1. Create a free Cloudinary account and open **Dashboard → API Keys**.
2. Put the cloud name / API key / API secret into the environment variables above.
3. Vehicle images upload server-side to the `elly-magari/vehicles` folder with
   automatic 1600px/`auto` quality transformation.
4. Uploads are validated server-side: JPG/PNG/WebP only, max 5 MB, max 6 files
   per request, max 12 images per vehicle. Old images are deleted from Cloudinary
   when removed from a vehicle or when the vehicle is deleted.
5. If Cloudinary env vars are **not** set, uploads fall back to local
   `public/uploads` storage — convenient for local development, **not** persisted
   on Vercel (serverless). Always configure Cloudinary in production.

## 4. Secure admin initialization

There are **no hardcoded admin credentials**. The first admin is created through
a one-time setup flow:

1. Deploy the site (with an empty `AdminUser` table).
2. Visit `https://your-domain.com/admin` — you are redirected to `/admin/setup`.
3. Create the first account (name, email, strong password). It gets the
   **SUPERADMIN** role.
4. The setup endpoint immediately disables itself once any admin exists
   (`409 Setup is already complete`). Additional admins would be `ADMIN` role
   (services/settings management restricted to SUPERADMIN by role checks).
5. Keep `SESSION_SECRET` stable across deployments, otherwise sessions are
   invalidated on each deploy.

**Sandbox note:** a demo SUPERADMIN already exists in this preview database:
`admin@ellymagari.co.tz` / `SecurePass123` — replace the password (or delete the
row) before going live.

## 5. Build & deployment (Vercel)

```bash
# 1. Push the schema to Neon (with provider switched to postgresql)
npx prisma migrate deploy

# 2. Verify the production build compiles
npm run build          # (repo also supports: bun run build)

# 3. Deploy to Vercel
vercel --prod
```

In Vercel **Settings → Environment Variables** add all variables from step 1
(Production + Preview). In **Settings → Build & Output Settings** keep the
default Next.js build; Prisma runs `prisma generate` automatically via the
postinstall hook.

### Deployment verification checklist
- [ ] `/` renders with hero image (Cloudinary/`hero.jpg` present)
- [ ] `/api/vehicles` returns JSON
- [ ] `/admin/setup` reachable **only** while no admin exists
- [ ] Login works, vehicle create/edit/delete works
- [ ] Image upload returns a Cloudinary URL
- [ ] WhatsApp buttons open `wa.me/255786068760` with prefilled text
- [ ] `/sitemap.xml` and `/robots.txt` respond
- [ ] Contact form submission appears in Admin → Inquiries

## Local development

```bash
bun install
bun run db:push       # sync SQLite schema (sandbox)
bun prisma/seed.ts    # optional demo data
bun run dev           # http://localhost:3000
bun run lint          # ESLint
```

## Project structure

```
prisma/                 schema.prisma, seed.ts
db/                     SQLite database (sandbox only)
src/app/
  page.tsx              Homepage
  (site)/               inventory, vehicles/[slug], services, about, contact
  admin/(auth)/         login, one-time setup
  admin/(dashboard)/    dashboard, vehicles CRUD, inquiries, services, settings
  api/                  vehicles (public), inquiries (public), admin/** (guarded)
  sitemap.ts robots.ts
src/components/
  site/                 header, footer, shell, vehicle card, WhatsApp helpers
  public/               inventory client, gallery, contact form
  admin/                admin shell, managers, forms
  ui/                   shadcn/ui primitives
src/lib/                db, auth (jwt/session), cloudinary, validators, rate-limit,
                        whatsapp, format, settings, services-data, vehicles
src/middleware.ts       admin route protection (edge, jose)
```

## Business information

- **Elly Magari** — Car dealership
- Location: Pasiansi, Mwanza, Tanzania (opposite Lenana Hotel)
- Phone / WhatsApp: +255 786 068 760
- Instagram: Elly Magari
- Services: buying & selling vehicles, vehicle importation on order, vehicle
  transportation, buying vehicles directly from customers

> All inventory entries in this build are **sample placeholders** with
> placeholder prices — replace them with real stock from the admin dashboard.
